/* eslint-disable */
import axios from 'axios'
import { showAlert } from './alerts'
const stripe = Stripe(
  'pk_test_51OrqK0HFj2bHLVP0pTfr5XcEPQKBUpkDTTBDpb491wlZXXFZd53NsKEk2mcjsd71vMCATUoIevo3CJ9A0TBpxmnZ00bFFkUC0y'
)

export const bookTour = async (tourId) => {
  try {
    // Get checkout session from API
    const session = await axios(`/api/v1/booking/checkout-session/${tourId}`)

    // Create checkout from & charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    })
  } catch (err) {
    showAlert('error', err)
  }
}
