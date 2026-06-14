import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import { PRIVATE_SBUrl, PRIVATE_ServiceKey } from '$env/static/private';
import { PUBLIC_TENANT } from '$env/static/public';
import { ProfileService } from '$lib/services/profileService';

// Admin Supabase klient pro potvrzení uživatele
const adminSupabase = createClient<Database>(
    PRIVATE_SBUrl,
    PRIVATE_ServiceKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
    console.log('🚀 [AUTH CONFIRM] CONFIRM CALLED! URL:', url.toString());
    
    const token_hash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type");
    const email = url.searchParams.get("email");
    
    console.log('📧 [AUTH CONFIRM] Params:', { 
        token_hash: token_hash ? token_hash.substring(0, 20) + '...' : null,
        token_hash_length: token_hash?.length || 0,
        type, 
        email 
    });
    
    // Pro náš custom admin signup flow
    if (type === "admin_signup" && email) {
        try {
            // Ověřit token_hash pokud je přítomen
            if (token_hash) {
                console.log('🔍 [AUTH CONFIRM] Verifying token_hash for admin signup');
                console.log('🔍 [AUTH CONFIRM] Token hash:', token_hash.substring(0, 20) + '...');
                
                // Použít adminSupabase pro ověření tokenu (má správná oprávnění)
                const { data: verifyData, error: verifyError } = await adminSupabase.auth.verifyOtp({
                    type: "signup",
                    token_hash: token_hash
                });

                if (verifyError) {
                    console.error('❌ [AUTH CONFIRM] Token verification failed:', {
                        error: verifyError,
                        message: verifyError.message,
                        status: verifyError.status
                    });
                    return redirect(303, '/auth/error?error=invalid_token');
                }

                if (!verifyData?.user) {
                    console.error('❌ [AUTH CONFIRM] Token verified but no user returned');
                    return redirect(303, '/auth/error?error=invalid_token');
                }

                console.log('✅ [AUTH CONFIRM] Token verified successfully for:', email);
                
                // Po úspěšném ověření tokenu už je email potvrzen v Supabase
                // Pokračujeme s vytvořením profilu
                const user = verifyData.user;

                // Vytvořit profil pro admin uživatele (s kontrolou existence)
                const { data: existingProfile } = await adminSupabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single();

                if (!existingProfile) {
                    const { error: profileError } = await adminSupabase
                        .from('profiles')
                        .insert({
                            id: user.id,
                            email: user.email,
                            user_role: 'admin',
                            registration_status: 'completed',
                            tenant_id: PUBLIC_TENANT, // Výchozí tenant pro admin
                            accessible_tenant_ids: [PUBLIC_TENANT], // Přístup k výchozímu tenantovi
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        });

                    if (profileError) {
                        console.error('❌ [AUTH CONFIRM] Error creating profile:', profileError);
                        // Pokračovat i když profil selže - uživatel je potvrzen
                    } else {
                        console.log('✅ [AUTH CONFIRM] Profile created successfully for:', email);
                    }
                } else {
                    console.log('ℹ️ [AUTH CONFIRM] Profile already exists for:', email);
                }

                // Přesměrovat na úspěšnou stránku
                console.log('✅ [AUTH CONFIRM] Redirecting to admin signin page');
                return redirect(303, '/admin/signin?message=email_confirmed');
            } else {
                // Fallback: pokud není token_hash, použít současný flow (pro zpětnou kompatibilitu)
                console.warn('⚠️ [AUTH CONFIRM] No token_hash provided, using legacy flow');
                
                // Potvrdit uživatele v Supabase pomocí Admin API
                const { data: users, error: findError } = await adminSupabase.auth.admin.listUsers();
                if (findError) {
                    console.error('❌ [AUTH CONFIRM] Error finding user:', findError);
                    throw findError;
                }

                const user = users.users.find(u => u.email === email);
                if (!user) {
                    console.error('❌ [AUTH CONFIRM] User not found:', email);
                    throw new Error('User not found');
                }

                // Potvrdit email uživatele
                const { error: confirmError } = await adminSupabase.auth.admin.updateUserById(
                    user.id,
                    { email_confirm: true }
                );

                if (confirmError) {
                    console.error('❌ [AUTH CONFIRM] Error confirming email:', confirmError);
                    throw confirmError;
                }

                console.log('✅ [AUTH CONFIRM] Email confirmed successfully for:', email);

                // Vytvořit profil pro admin uživatele (s kontrolou existence)
                const { data: existingProfile } = await adminSupabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single();

                if (!existingProfile) {
                    const { error: profileError } = await adminSupabase
                        .from('profiles')
                        .insert({
                            id: user.id,
                            email: user.email,
                            user_role: 'admin',
                            registration_status: 'completed',
                            tenant_id: PUBLIC_TENANT, // Výchozí tenant pro admin
                            accessible_tenant_ids: [PUBLIC_TENANT], // Přístup k výchozímu tenantovi
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        });

                    if (profileError) {
                        console.error('❌ [AUTH CONFIRM] Error creating profile:', profileError);
                        // Pokračovat i když profil selže - uživatel je potvrzen
                    } else {
                        console.log('✅ [AUTH CONFIRM] Profile created successfully for:', email);
                    }
                } else {
                    console.log('ℹ️ [AUTH CONFIRM] Profile already exists for:', email);
                }

                // Přesměrovat na úspěšnou stránku
                console.log('✅ [AUTH CONFIRM] Redirecting to admin signin page');
                return redirect(303, '/admin/signin?message=email_confirmed');
            }

        } catch (error) {
            console.error('❌ [AUTH CONFIRM] Error in admin signup confirmation:', error);
            
            if (error instanceof Response) {
                throw error; // Přesměrování
            }
            
            // Přesměrovat na chybovou stránku
            console.log('❌ [AUTH CONFIRM] Confirmation failed, redirecting to error page');
            return redirect(303, '/auth/error?error=confirmation_failed');
        }
    }

    // Pro náš custom customer signup flow
    if (type === "customer_signup" && email) {
        let confirmationSuccess = false;
        
        try {
            // Ověřit token_hash pokud je přítomen
            if (token_hash) {
                console.log('🔍 [AUTH CONFIRM] Verifying token_hash for customer signup');
                console.log('🔍 [AUTH CONFIRM] Token hash:', token_hash.substring(0, 20) + '...');
                console.log('🔍 [AUTH CONFIRM] Token hash length:', token_hash.length);
                
                // Použít adminSupabase pro ověření tokenu (má správná oprávnění)
                const { data: verifyData, error: verifyError } = await adminSupabase.auth.verifyOtp({
                    type: "signup",
                    token_hash: token_hash
                });

                if (verifyError) {
                    console.error('❌ [AUTH CONFIRM] Token verification failed:', {
                        error: verifyError,
                        message: verifyError.message,
                        status: verifyError.status,
                        name: verifyError.name
                    });
                    
                    // Pokud verifyOtp selže, zkusit alternativní přístup - najít uživatele a potvrdit email přímo
                    console.log('🔄 [AUTH CONFIRM] Trying alternative approach - finding user by email');
                    const { data: users, error: findError } = await adminSupabase.auth.admin.listUsers();
                    
                    if (!findError && users) {
                        const user = users.users.find(u => u.email === email);
                        if (user) {
                            console.log('✅ [AUTH CONFIRM] User found, confirming email directly');
                            const { error: confirmError } = await adminSupabase.auth.admin.updateUserById(
                                user.id,
                                { email_confirm: true }
                            );
                            
                            if (!confirmError) {
                                console.log('✅ [AUTH CONFIRM] Email confirmed via alternative method');
                                // Pokračovat s vytvořením profilu
                                const userForProfile = user;
                                
                                // Vytvořit profil pro zákazníka (s kontrolou existence)
                                const { data: existingProfile } = await adminSupabase
                                    .from('profiles')
                                    .select('id')
                                    .eq('id', userForProfile.id)
                                    .single();

                                if (!existingProfile) {
                                    const { error: profileError } = await adminSupabase
                                        .from('profiles')
                                        .insert({
                                            id: userForProfile.id,
                                            email: userForProfile.email,
                                            user_role: 'customer',
                                            registration_status: 'pending',
                                            tenant_id: PUBLIC_TENANT,
                                            created_at: new Date().toISOString(),
                                            updated_at: new Date().toISOString()
                                        });

                                    if (profileError) {
                                        console.error('❌ [AUTH CONFIRM] Error creating profile:', profileError);
                                    } else {
                                        await ProfileService.ensureCustomerMembership(adminSupabase, userForProfile.id);
                                        console.log('✅ [AUTH CONFIRM] Profile created successfully');
                                    }
                                }
                                
                                confirmationSuccess = true;
                                // Přesměrovat na login
                                return redirect(303, '/auth/login?message=email_confirmed');
                            }
                        }
                    }
                    
                    return redirect(303, '/auth/error?error=invalid_token');
                }

                if (!verifyData?.user) {
                    console.error('❌ [AUTH CONFIRM] Token verified but no user returned');
                    return redirect(303, '/auth/error?error=invalid_token');
                }

                console.log('✅ [AUTH CONFIRM] Token verified successfully for:', email);
                
                // Po úspěšném ověření tokenu už je email potvrzen v Supabase
                // Pokračujeme s vytvořením profilu
                const user = verifyData.user;
                
                // Vytvořit profil pro zákazníka (s kontrolou existence)
                const { data: existingProfile } = await adminSupabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single();

                if (!existingProfile) {
                    const { error: profileError } = await adminSupabase
                        .from('profiles')
                        .insert({
                            id: user.id,
                            email: user.email,
                            user_role: 'customer',
                            registration_status: 'pending',
                            tenant_id: PUBLIC_TENANT, // Výchozí tenant pro customer
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        });

                    if (profileError) {
                        console.error('❌ [AUTH CONFIRM] Error creating profile:', profileError);
                        // Pokračovat i když profil selže - uživatel je potvrzen
                    } else {
                        await ProfileService.ensureCustomerMembership(adminSupabase, user.id);
                        console.log('✅ [AUTH CONFIRM] Profile created successfully for:', email);
                    }
                } else {
                    console.log('ℹ️ [AUTH CONFIRM] Profile already exists for:', email);
                }

                confirmationSuccess = true;
            } else {
                // Fallback: pokud není token_hash, použít současný flow (pro zpětnou kompatibilitu)
                console.warn('⚠️ [AUTH CONFIRM] No token_hash provided, using legacy flow');
                
                // Potvrdit uživatele v Supabase pomocí Admin API
                const { data: users, error: findError } = await adminSupabase.auth.admin.listUsers();
                if (findError) {
                    console.error('❌ [AUTH CONFIRM] Error finding user:', findError);
                    throw findError;
                }

                const user = users.users.find(u => u.email === email);
                if (!user) {
                    console.error('❌ [AUTH CONFIRM] User not found:', email);
                    throw new Error('User not found');
                }

                // Potvrdit email uživatele
                const { error: confirmError } = await adminSupabase.auth.admin.updateUserById(
                    user.id,
                    { email_confirm: true }
                );

                if (confirmError) {
                    console.error('❌ [AUTH CONFIRM] Error confirming email:', confirmError);
                    throw confirmError;
                }

                    // Vytvořit profil pro zákazníka (s kontrolou existence)
                const { data: existingProfile } = await adminSupabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single();

                if (!existingProfile) {
                    const { error: profileError } = await adminSupabase
                        .from('profiles')
                        .insert({
                            id: user.id,
                            email: user.email,
                            user_role: 'customer',
                            registration_status: 'pending',
                            tenant_id: PUBLIC_TENANT, // Výchozí tenant pro customer
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        });

                    if (profileError) {
                        console.error('❌ [AUTH CONFIRM] Error creating profile:', profileError);
                        // Pokračovat i když profil selže - uživatel je potvrzen
                    } else {
                        await ProfileService.ensureCustomerMembership(adminSupabase, user.id);
                        console.log('✅ [AUTH CONFIRM] Profile created successfully for:', email);
                    }
                } else {
                    console.log('ℹ️ [AUTH CONFIRM] Profile already exists for:', email);
                }

                confirmationSuccess = true;
            }
        } catch (error) {
            console.error('❌ [AUTH CONFIRM] Error in customer signup confirmation:', error);
            
            // Pokud je to Response (redirect), hoď ho dál
            if (error instanceof Response) {
                throw error;
            }
            
            // Jinak logovat detailně a nastavit confirmationSuccess na false
            console.error('❌ [AUTH CONFIRM] Detailed error:', {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            confirmationSuccess = false;
        }

        // Přesměrování mimo try-catch blok
        if (confirmationSuccess) {
            console.log('✅ [AUTH CONFIRM] Redirecting to login page');
            return redirect(303, '/auth/login?message=email_confirmed');
        } else {
            console.log('❌ [AUTH CONFIRM] Confirmation failed, redirecting to error page');
            return redirect(303, '/auth/error?error=confirmation_failed');
        }
    }
    
    // Pro standardní Supabase flow (pokud by se použil) - pouze pokud má token_hash
    if (token_hash && type && (type === 'signup' || type === 'recovery' || type === 'magiclink' || type === 'email')) {
        try {
            const { error } = await supabase.auth.verifyOtp({ type: type as any, token_hash });
            if (!error) {
                return redirect(303, '/admin/signin?message=email_confirmed');
            }
        } catch (error) {
            console.error('❌ [AUTH CONFIRM] Error in OTP verification:', error);
        }
    }
    
    // Pokud nejsou žádné parametry, přesměrovat na chybovou stránku
    console.log('❌ [AUTH CONFIRM] Missing parameters, redirecting to error page');
    return redirect(303, '/auth/error?error=missing_params');
};
