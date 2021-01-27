export const stripe = {
  charges: {
    create: jest
      .fn()
      .mockImplementation(async ({ amount, source, currency }) => {
        if (!amount || !source || !currency) {
          throw new Error(
            'Lacking options for payment. Must provide amount, source and currency'
          )
        }
        return {
          success: true,
          id: `stripepayment${Math.floor(Math.random() * 100000)}`,
        }
      }),
  },
}
