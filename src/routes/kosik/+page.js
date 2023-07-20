import client from '../../lib/sanityClient'

export async function load() {
	try {		
//		const data = await client.fetch('*[_type == "order"] | order(_createdAt desc) [0]')
		const data = await client.fetch('*[_type == "order"] | order(_createdAt desc) [0] { orderNumber }');


		if (data) {
			// Check if the data contains the orderNumber field
			if (!data.orderNumber) {
				throw new Error('orderNumber field is missing.')
			}

			// Increment the orderNumber by 1
			// const newOrderNumber = data.orderNumber + 1

			// Update the order with the new orderNumber
			/* const updatedOrder = await client
				.patch(data._id)
				.set({ orderNumber: newOrderNumber })
				.commit()

			console.log('New orderNumber:', newOrderNumber) */ // Log the new orderNumber
			console.log(data.orderNumber);
			return {
				orders: data
			}
		}

		// If no order data found, return an error
		throw new Error('No order data found.')
	} catch (error) {
		console.error('Error:', error.message)
		return {
			status: 500,
			body: new Error('Internal Server Error')
		}
	}
}
