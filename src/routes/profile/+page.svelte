<script lang="ts">
	import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
	import type { Database } from '$lib/types/database.types';
	import { validateProfileForInvoicing, getProfileValidationMessage } from "$lib/utils/profileValidation";
	import { getAllDeliveryMethods } from "$lib/constants/deliveryMethods";
	import { formatDateToCzech } from "$lib/utils/formatting";

	type Order = Database['public']['Tables']['orders']['Row'] & {
		grouped_items: Array<{
			date: string;
			items: Array<{
				variant: {
					variant_number: string;
					description: string;
					menu: {
						soup: string;
					};
				};
				price: number;
				quantity: number;
			}>;
		}>;
	};

	export let data;
	export let form;
	let { session, supabase, profile, orders, generalSettings } = data;
	$: ({ session, supabase, profile, orders, generalSettings } = data);

	let visible: boolean = true;
	let expandedOrders: { [key: string]: boolean } = {};
	let selectedOrderId: string | null = null;

	const toggleVisible = () => {
		visible = !visible;
	};

	function toggleOrderDetails(orderId: string) {
		if (selectedOrderId === orderId) {
			selectedOrderId = null;
		} else {
			selectedOrderId = orderId;
		}
		expandedOrders[orderId] = !expandedOrders[orderId];
	}

	function calculateTotalItems(items: Array<{ quantity: number }>): number {
		return items.reduce((total, item) => total + (item.quantity || 0), 0);
	}

	let profileForm: HTMLFormElement;
	let loading = false;
	let username: string = profile?.username ?? "";
	let first_name: string = profile?.first_name ?? "";
	let last_name: string = profile?.last_name ?? "";
	let telephone: string = profile?.telephone ?? "";
	let street: string = profile?.street ?? "";
	let street_number: string = profile?.street_number ?? "";
	let city: string = profile?.city ?? "";
	let ico: string = profile?.ico ?? "";
	let dic: string = profile?.dic ?? "";
	let company: string = profile?.company ?? "";
	let zip_code: string = profile?.zip_code ?? "";
	let allergies: string = profile?.allergies ? "yes" : "no";
	let allergiesDescription: string = profile?.allergies_description ?? "";
	let deliveryMethod: string = profile?.delivery_method ?? "";
	let paymentMethod: string = profile?.payment_method ?? "";

	let profileValidationMessage = '';

	// Get all delivery method options for profile (including empty option)
	const deliveryMethodOptions = getAllDeliveryMethods(false, true);

	let fieldErrors: { [key: string]: string } = {};

	function validateField(field: string, value: string | undefined): string {
		if (!value) {
			switch (field) {
				case 'first_name': return 'Jméno je povinné';
				case 'last_name': return 'Příjmení je povinné';
				case 'street': return 'Ulice je povinná';
				case 'street_number': return 'Číslo popisné je povinné';
				case 'city': return 'Město je povinné';
				case 'zip_code': return 'PSČ je povinné';
				case 'telephone': return 'Telefon je povinný';
				case 'delivery_method': return 'Způsob dodání je povinný';
				case 'payment_method': return 'Způsob platby je povinný';
				case 'company': return paymentMethod === 'bankWithInvoice' ? 'Firma je povinná pro fakturaci' : '';
				case 'ico': return paymentMethod === 'bankWithInvoice' ? 'IČO je povinné pro fakturaci' : '';
				case 'dic': return paymentMethod === 'bankWithInvoice' ? 'DIČ je povinné pro fakturaci' : '';
				default: return '';
			}
		}
		return '';
	}

	$: {
		fieldErrors = {
			first_name: validateField('first_name', first_name),
			last_name: validateField('last_name', last_name),
			street: validateField('street', street),
			street_number: validateField('street_number', street_number),
			city: validateField('city', city),
			zip_code: validateField('zip_code', zip_code),
			telephone: validateField('telephone', telephone),
			delivery_method: validateField('delivery_method', deliveryMethod),
			payment_method: validateField('payment_method', paymentMethod),
			company: validateField('company', company),
			ico: validateField('ico', ico),
			dic: validateField('dic', dic)
		};

		const validationResult = validateProfileForInvoicing({
			first_name,
			last_name,
			street,
			street_number,
			city,
			zip_code,
			email: session?.user?.email,
			company,
			ico,
			dic,
			telephone,
			delivery_method: deliveryMethod,
			payment_method: paymentMethod,
			allergies: allergies === "yes",
			allergies_description: allergiesDescription
		});
		profileValidationMessage = getProfileValidationMessage(validationResult);
	}

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async () => {
			loading = false;
		};
	};

	// Data deletion request variables
	let deletionConfirmed = false;
	let legalUnderstanding = false;
	let isDataManagementExpanded = false;
</script>

<svelte:head>
  <title>Účet - {generalSettings?.shopName ?? 'Účet'}</title>
  <meta name="description" content="Účet" />
</svelte:head>

<section class="max-w-screen-xl px-4 py-16 mx-auto mb-10 rounded-lg bg-stone-100">
  <h1 class="mb-8 text-4xl font-extrabold tracking-tight text-center text-gray-900 md:text-5xl">
    Profil účtu
  </h1>

  {#if profileValidationMessage}
    <div class="max-w-4xl mx-auto mb-6">
      <div class="bg-white border rounded-lg shadow-md p-8 border-gray-400">
        <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-yellow-800">
            <span class="font-medium">Upozornění:</span> 
            {#each profileValidationMessage.split('\n') as line}
              <span>{line}</span><br>
            {/each}
          </p>
        </div>
      </div>
    </div>
  {/if}

  <form
    class="form-widget"
    method="post"
    action="?/update"
    use:enhance={handleSubmit}
    bind:this={profileForm}
  >
    <div class="max-w-4xl mx-auto">
      <div class="bg-white border rounded-lg shadow-md p-8 border-gray-400">
        <div class="space-y-6 text-gray-600">
          <!-- Email section -->
          <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div class="flex flex-col items-center md:flex-row gap-4">
              <div class="flex justify-start basis-1/3">
                <label for="email">Email / uživatel</label>
              </div>
              <div class="w-full basis-2/3">
                <input
                  value={session.user.email}
                  disabled
                  type="email"
                  id="email"
                  class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="Email"
                />
              </div>
            </div>
          </div>

          <!-- Personal info section -->
          <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2>Osobní údaje</h2>
            <div class="space-y-4">
              <div class="flex flex-col items-center md:flex-row gap-4">
                <div class="flex justify-start basis-1/3">
                  <label for="first_name">Jméno</label>
                </div>
                <div class="w-full basis-2/3">
                  <input
                    bind:value={first_name}
                    type="text"
                    name="first_name"
                    id="first_name"
                    class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    required
                    placeholder="Jméno"
                  />
                  {#if fieldErrors.first_name}
                    <p class="mt-1 text-sm text-red-600">{fieldErrors.first_name}</p>
                  {/if}
                </div>
              </div>

              <div class="flex flex-col items-center md:flex-row gap-4">
                <div class="flex justify-start basis-1/3">
                  <label for="last_name">Příjmení</label>
                </div>
                <div class="w-full basis-2/3">
                  <input
                    bind:value={last_name}
                    type="text"
                    name="last_name"
                    id="last_name"
                    class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    placeholder="Příjmení"
                  />
                  {#if fieldErrors.last_name}
                    <p class="mt-1 text-sm text-red-600">{fieldErrors.last_name}</p>
                  {/if}
                </div>
              </div>

              <div class="flex flex-col items-center md:flex-row gap-4">
                <div class="flex justify-start basis-1/3">
                  <label for="telephone">Telefon</label>
                </div>
                <div class="w-full basis-2/3">
                  <input
                    bind:value={telephone}
                    type="text"
                    name="telephone"
                    id="telephone"
                    class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    placeholder="Telefon"
                  />
                  {#if fieldErrors.telephone}
                    <p class="mt-1 text-sm text-red-600">{fieldErrors.telephone}</p>
                  {/if}
                </div>
              </div>
            </div>
          </div>

          <!-- Delivery and Payment section -->
          <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2>Způsob dodání a platby</h2>
            <div class="space-y-4">
              <div class="flex flex-col items-center md:flex-row gap-4">
                <div class="flex justify-start basis-1/3">
                  <label for="delivery_method">Dodání</label>
                </div>
                <div class="w-full basis-2/3">
                  <select
                    bind:value={deliveryMethod}
                    name="delivery_method"
                    id="delivery_method"
                    class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  >
                    {#each deliveryMethodOptions as option}
                      <option value={option.value}>{option.label}</option>
                    {/each}
                  </select>
                  {#if fieldErrors.delivery_method}
                    <p class="mt-1 text-sm text-red-600">{fieldErrors.delivery_method}</p>
                  {/if}
                </div>
              </div>

              <div class="flex flex-col items-center md:flex-row gap-4">
                <div class="flex justify-start basis-1/3">
                  <label for="payment_method">Platba</label>
                </div>
                <div class="w-full basis-2/3">
                  <select
                    bind:value={paymentMethod}
                    name="payment_method"
                    id="payment_method"
                    class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  >
                    <option value="">Vyberte způsob platby</option>
                    <option value="bankNoInvoice">Bankovní převod bez faktury</option>
                    <option value="bankWithInvoice">Bankovní převod s fakturou</option>
                    <option value="cash">Hotově</option>
                  </select>
                  {#if fieldErrors.payment_method}
                    <p class="mt-1 text-sm text-red-600">{fieldErrors.payment_method}</p>
                  {/if}
                </div>
              </div>
            </div>
          </div>

          <!-- Alergie -->
          <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div class="flex flex-col items-center md:flex-row gap-4">
              <div class="flex justify-start basis-1/3">
                <label>Alergie <span class="text-red-500">*</span></label>
              </div>
              <div class="w-full basis-2/3 flex gap-4 justify-center">
                <label class="flex items-center">
                  <input
                    type="radio"
                    name="allergies"
                    value="no"
                    bind:group={allergies}
                    class="mr-2"
                    required
                  />
                  Ne
                </label>
                <label class="flex items-center">
                  <input
                    type="radio"
                    name="allergies"
                    value="yes"
                    bind:group={allergies}
                    class="mr-2"
                    required
                  />
                  Ano
                </label>
              </div>
            </div>
          </div>

          {#if allergies === "yes"}
          <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div class="flex flex-col items-center md:flex-row gap-4">
              <div class="flex justify-start basis-1/3">
                <label for="allergiesDescription">Popis alergií</label>
              </div>
              <div class="w-full basis-2/3">
                <textarea
                  id="allergiesDescription"
                  name="allergies_description"
                  bind:value={allergiesDescription}
                  maxlength="300"
                  class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="Popište vaše alergie (max 300 znaků)"
                  rows="3"
                ></textarea>
                <span class="text-sm text-gray-500 text-center block">
                  Zbývá {300 - (allergiesDescription?.length || 0)} znaků
                </span>
              </div>
            </div>
          </div>
        {/if}

          {#if visible}
            <!-- Address section -->
            <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h2>Adresa</h2>
              <div class="space-y-4">
                <div class="flex flex-col items-center md:flex-row gap-4">
                  <div class="flex justify-start basis-1/3">
                    <label for="street">Ulice</label>
                  </div>
                  <div class="w-full basis-2/3">
                    <input
                      bind:value={street}
                      name="street"
                      type="text"
                      id="street"
                      class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="Ulice"
                    />
                    {#if fieldErrors.street}
                      <p class="mt-1 text-sm text-red-600">{fieldErrors.street}</p>
                    {/if}
                  </div>
                </div>
                <div class="flex flex-col items-center md:flex-row gap-4">
                  <div class="flex justify-start basis-1/3">
                    <label for="street_number">Číslo popisné</label>
                  </div>
                  <div class="w-full basis-2/3">
                    <input
                      bind:value={street_number}
                      type="text"
                      name="street_number"
                      id="street_number"
                      class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="Číslo popisné"
                    />
                    {#if fieldErrors.street_number}
                      <p class="mt-1 text-sm text-red-600">{fieldErrors.street_number}</p>
                    {/if}
                  </div>
                </div>
                <div class="flex flex-col items-center md:flex-row gap-4">
                  <div class="flex justify-start basis-1/3">
                    <label for="city">Město</label>
                  </div>
                  <div class="w-full basis-2/3">
                    <input
                      bind:value={city}
                      type="text"
                      name="city"
                      id="city"
                      class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="Město"
                    />
                    {#if fieldErrors.city}
                      <p class="mt-1 text-sm text-red-600">{fieldErrors.city}</p>
                    {/if}
                  </div>
                </div>
                <div class="flex flex-col items-center md:flex-row gap-4">
                  <div class="flex justify-start basis-1/3">
                    <label for="zip_code">PSČ</label>
                  </div>
                  <div class="w-full basis-2/3">
                    <input
                      bind:value={zip_code}
                      type="text"
                      name="zip_code"
                      id="zip_code"
                      class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="PSČ"
                    />
                    {#if fieldErrors.zip_code}
                      <p class="mt-1 text-sm text-red-600">{fieldErrors.zip_code}</p>
                    {/if}
                  </div>
                </div>
                <div class="flex flex-col items-center md:flex-row gap-4">
                  <div class="flex justify-start basis-1/3">
                    <label for="company">Firma</label>
                  </div>
                  <div class="w-full basis-2/3">
                    <input
                      bind:value={company}
                      type="text"
                      name="company"
                      id="company"
                      class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="Firma"
                    />
                    {#if fieldErrors.company}
                      <p class="mt-1 text-sm text-red-600">{fieldErrors.company}</p>
                    {/if}
                  </div>
                </div>
                <div class="flex flex-col items-center md:flex-row gap-4">
                  <div class="flex justify-start basis-1/3">
                    <label for="ico">IČO</label>
                  </div>
                  <div class="w-full basis-2/3">
                    <input
                      bind:value={ico}
                      type="text"
                      name="ico"
                      id="ico"
                      class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="IČO"
                    />
                    {#if fieldErrors.ico}
                      <p class="mt-1 text-sm text-red-600">{fieldErrors.ico}</p>
                    {/if}
                  </div>
                </div>
                <div class="flex flex-col items-center md:flex-row gap-4">
                  <div class="flex justify-start basis-1/3">
                    <label for="dic">DIČ</label>
                  </div>
                  <div class="w-full basis-2/3">
                    <input
                      bind:value={dic}
                      type="text"
                      name="dic"
                      id="dic"
                      class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="DIČ"
                    />
                    {#if fieldErrors.dic}
                      <p class="mt-1 text-sm text-red-600">{fieldErrors.dic}</p>
                    {/if}
                  </div>
                </div>
              </div>
            </div>          

          
          {/if}

          <!-- Submit button -->
          <div class="mt-8">
            <button
              type="submit"
              class="w-full px-6 py-3 text-base font-semibold text-center text-white bg-green-800 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Ukládá se..." : "Uložit změny"}
            </button>
          </div>

          {#if form?.message}
            <div class="mt-6 p-4 rounded-lg" class:bg-red-50={!form.message.success} class:bg-green-50={form.message.success}>
              <p class="text-center font-medium" class:text-red-700={!form.message.success} class:text-green-700={form.message.success}>
                {form.message.display}
              </p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </form>

  <!-- Orders section -->
  <div class="page-content mt-8">
    <h2 class="text-center">
      Objednávky
    </h2>

    {#if !orders || orders.length === 0}
      <div class="flex flex-col items-center justify-center p-12 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p class="text-xl">Zatím nemáte žádné objednávky</p>
        <a href="/obedy" class="mt-4 bg-green-800 text-white py-2 px-6 rounded-lg hover:bg-green-700 font-medium">
          Přejít na jídelníček
        </a>
      </div>
    {:else}
      <div class="bg-gray-50 rounded-lg p-3 mb-6 flex justify-between items-center">
        <p class="text-gray-600 font-medium">Celkem objednávek: {orders.length}</p>
      </div>

      <div class="space-y-6">
        {#each orders as order}
          <div class="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div
              class="flex justify-between items-center p-4 cursor-pointer"
              class:bg-green-50={selectedOrderId === order.id}
              on:click={() => toggleOrderDetails(order.id)}
            >
              <div class="flex items-center space-x-3 gap-4">
                <div class="flex items-center justify-center font-semibold">
                  {order.order_number}
                </div>
                <div class="gap-4 flex">
                  <span class="font-semibold">{order.created_at ? formatDateToCzech(order.created_at) : 'N/A'}</span> <span class="text-sm text-gray-500"> {order.total_price} {order.currency}</span>
                </div>
              </div>

              <div class="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" class:rotate-180={expandedOrders[order.id]} viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            {#if expandedOrders[order.id]}
              <div class="border-t border-gray-200 p-5">
                <div class="grid md:grid-cols-3 gap-4 mb-4">
                  <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="text-sm text-gray-500">Celková cena</div>
                    <div class="font-semibold text-lg">{order.total_price},-</div>
                  </div>
                  <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="text-sm text-gray-500">Číslo objednávky</div>
                    <div class="font-semibold text-lg">{order.order_number}</div>
                  </div>
                </div>                

                <div class="space-y-4">
                  {#each order.order_items as item}
                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                      <div class="bg-gray-50 border-b border-gray-200 p-3 flex justify-between items-center">
                        <div class="font-medium">{item.product_name}</div>
                        <div class="text-sm text-gray-500">
                          {item.quantity}x
                        </div>
                      </div>

                      <div class="p-4">
                        <div class="flex items-center mb-3">
                          <div class="h-6 w-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0V5z" clip-rule="evenodd" />
                            </svg>
                          </div>
                          <div class="font-medium">Polévka: {group.items[0].variant.menu.soup}</div>
                        </div>

                        <div class="space-y-3">
                          {#each group.items as item}
                            <div class="border border-gray-100 rounded-lg p-3 bg-gray-50">
                              <div class="grid md:grid-cols-4 gap-2">
                                <div class="col-span-2">
                                  <div class="text-sm text-gray-500">Varianta</div>
                                  <div>{item.variant.variant_number}. {item.variant.description}</div>
                                </div>
                                <div>
                                  <div class="text-sm text-gray-500">Cena</div>
                                  <div class="font-medium">{item.price} Kč</div>
                                </div>
                                <div>
                                  <div class="text-sm text-gray-500">Množství</div>
                                  <div class="font-medium">{item.quantity} ks</div>
                                </div>
                              </div>
                            </div>
                          {/each}
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Data deletion section for GDPR compliance -->   
  <div class="page-content mt-8">
    <div class="border border-gray-200 rounded-lg bg-gray-50">
      <!-- Collapsible header -->
      <button 
        type="button"
        class="w-full p-6 flex items-center justify-between text-left hover:bg-gray-100 rounded-lg focus:outline-none"
        on:click={() => isDataManagementExpanded = !isDataManagementExpanded}
      >
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.968-2.383a9.954 9.954 0 01-5.968 2.383m0 0a9.954 9.954 0 01-5.968-2.383m0 0a9.954 9.954 0 005.968-2.383" />
            </svg>
          </div>
          <div>
            <h4>
              Správa osobních údajů
            </h4>
            {#if data.profile?.data_deletion_requested}
              <p class="text-sm text-blue-600 mt-1">
                Žádost o smazání je aktivní
              </p>
            {:else}
              <p class="text-sm text-gray-500 mt-1">
                GDPR práva a smazání dat
              </p>
            {/if}
          </div>
        </div>
        
        <div class="flex-shrink-0">
          <svg 
            class="h-5 w-5 text-gray-400 {isDataManagementExpanded ? 'rotate-180' : ''}" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <!-- Collapsible content -->
      {#if isDataManagementExpanded}
        <div class="px-6 pb-6">
          <div class="space-y-4">
            <div class="text-sm text-gray-600">
              <p class="mb-2">V souladu s <strong>GDPR (EU 2016/679)</strong> můžete požádat o úplné smazání vašich osobních údajů.</p>
            </div>
      
            {#if data.profile?.data_deletion_requested}
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-sm font-medium text-blue-900 mb-1">
                      Žádost o smazání dat je aktivní
                    </h4>
                    <p class="text-sm text-blue-800 mb-2">
                      <strong>Podáno:</strong> {data.profile.data_deletion_date ? new Date(data.profile.data_deletion_date).toLocaleDateString('cs-CZ') : 'N/A'}<br>
                      <strong>Smazání:</strong> {data.profile.data_deletion_scheduled ? new Date(data.profile.data_deletion_scheduled).toLocaleDateString('cs-CZ') : 'N/A'}
                    </p>
                    <div class="bg-blue-100 rounded p-3 text-xs text-blue-700">
                      <p class="font-medium mb-1">💡 Možnost návratu:</p>
                      <p>Máte <strong>30 dní na rozmyšlenou</strong>. Pokud si to rozmyslíte, můžete účet kdykoliv obnovit pomocí odkazu zaslaného na váš email.</p>
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <div class="mb-4">
                  <h4 class="text-sm font-medium text-gray-900 mb-2">
                    Co se stane při smazání dat:
                  </h4>
                  <ul class="text-xs text-gray-600 space-y-1 ml-4">
                    <li class="flex items-start">
                      <span class="text-green-500 mr-2 mt-0.5">•</span>
                      <span><strong>30 dní na rozmyšlenou</strong> - možnost zrušení žádosti</span>
                    </li>
                    <li class="flex items-start">
                      <span class="text-green-500 mr-2 mt-0.5">•</span>
                      <span>Smazání všech osobních údajů po uplynutí lhůty</span>
                    </li>
                    <li class="flex items-start">
                      <span class="text-blue-500 mr-2 mt-0.5">•</span>
                      <span>Faktury zůstanou uloženy 10 let (zákonná povinnost)</span>
                    </li>
                    <li class="flex items-start">
                      <span class="text-gray-400 mr-2 mt-0.5">•</span>
                      <span>Anonymizované statistiky mohou zůstat zachovány</span>
                    </li>
                  </ul>
                </div>
      
                <form method="POST" action="?/requestDataDeletion" class="space-y-3">
                  <div class="space-y-2">
                    <div class="flex items-start space-x-2 text-sm">
                      <input type="checkbox" required class="mt-1 h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500" bind:checked={deletionConfirmed}>
                      <span class="text-gray-700">
                        Žádám o smazání všech mých osobních údajů a rozumím, že mám <strong>30 dní na zrušení</strong> této žádosti
                      </span>
                    </div>
                    
                    <div class="flex items-start space-x-2 text-sm">
                      <input type="checkbox" required class="mt-1 h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500" bind:checked={legalUnderstanding}>
                      <span class="text-gray-700">
                        Souhlasím s uchováním fakturačních údajů po zákonnou dobu 
                        (zákon č. 563/1991 Sb., o účetnictví)
                      </span>
                    </div>
                  </div>
      
                  <div class="flex items-center space-x-3 pt-2">
                    <button 
                      type="submit" 
                      disabled={!deletionConfirmed || !legalUnderstanding}
                      class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-700 border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Požádat o smazání dat
                    </button>
                    
                    <p class="text-xs text-gray-500">
                      Po odeslání dostanete email
                    </p>
                  </div>
                </form>
              </div>
            {/if}
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-200">
            <p class="text-xs text-gray-500 text-center">
              Zpracování v souladu s GDPR (EU 2016/679) a českým zákonem č. 110/2019 Sb. o zpracování osobních údajů
            </p>
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  label {
    color: black;
    font-size: 1.1rem;    
    font-weight: bold;
  }

  h2 {
    color: black;
    font-size: 1.4rem;    
    font-weight: bold;
    padding: 1rem 0rem 3rem 0rem;
    text-decoration: underline #737373 1px;  
  }

  h3 {
    color: black;
    font-size: 1.0rem;    
    font-weight: bold;    
    text-decoration: underline #737373 1px;  
  }

  h4 {
    color: black;
    font-size: 1.2rem;    
    font-weight: bold;    
    text-decoration: underline #737373 1px;  
  }
</style>

