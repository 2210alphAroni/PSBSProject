using static PSBS.Model.Payment;

namespace PSBS.Services
{
    public class Ibkash
    {
        public interface IBKashService
        {
            Task<PaymentResponse> InitiatePaymentAsync(PaymentRequest request);
            Task<PaymentResponse> ExecutePaymentAsync(string paymentId);
            Task<PaymentResponse> QueryPaymentAsync(string paymentId);
            Task<bool> VerifyPaymentAsync(PaymentCallback callback);
        }
    }
}
