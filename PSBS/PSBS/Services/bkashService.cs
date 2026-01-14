using PSBS.Model;
using PSBS.Services;
using System.Text;
using System.Text.Json;

namespace PSBS.Services
{

    public class BKashService : IBKashService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<BKashService> _logger;
        private readonly HttpClient _httpClient;

        public BKashService(IConfiguration configuration, ILogger<BKashService> logger, HttpClient httpClient)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClient = httpClient;
        }

        public async Task<PaymentResponse> InitiatePaymentAsync(PaymentRequest request)
        {
            try
            {
                // Ensure OrderId is not empty
                if (string.IsNullOrWhiteSpace(request.OrderId))
                {
                    request.OrderId = $"Inv{new Random().Next(100000, 999999)}";
                }

                var appKey = _configuration["bKash:AppKey"] ?? string.Empty;
                var appSecret = _configuration["bKash:AppSecret"] ?? string.Empty;
                var username = _configuration["bKash:Username"] ?? string.Empty;
                var password = _configuration["bKash:Password"] ?? string.Empty;
                var baseUrl = _configuration["bKash:BaseUrl"] ?? "https://tokenized.sandbox.bka.sh/v1.2.0-beta";

                // First, get access token (PHP: getAuthToken())
                var token = await GetAccessTokenAsync(baseUrl, appKey, appSecret, username, password);
                if (string.IsNullOrEmpty(token))
                {
                    return new PaymentResponse
                    {
                        Success = false,
                        ErrorMessage = "Auth Failed",
                        Message = "Unable to authenticate with bKash API"
                    };
                }

                // Create payment request (PHP: createPaymentLink)
                // PHP: BKS_URL = 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout'
                // PHP: BKS_URL . '/create' = baseUrl + "/tokenized/checkout/create"
                // But our baseUrl is already "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
                // So we need: baseUrl + "/tokenized/checkout/create"
                var paymentUrl = $"{baseUrl}/tokenized/checkout/create";
                var paymentRequest = new
                {
                    mode = "0011",
                    amount = request.Amount.ToString("F2"),
                    payerReference = "test for api",
                    callbackURL = request.SuccessUrl,
                    currency = request.Currency,
                    intent = "sale",
                    merchantInvoiceNumber = request.OrderId
                };

                var jsonContent = JsonSerializer.Serialize(paymentRequest);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                // Headers: Content-Type:application/json, Authorization:token, X-APP-Key:appKey
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", token);
                _httpClient.DefaultRequestHeaders.Add("X-APP-Key", appKey);

                var response = await _httpClient.PostAsync(paymentUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("bKash Payment Initiation Response: {Response}", responseContent);

                var apiResponse = JsonSerializer.Deserialize<BKashApiResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (apiResponse == null)
                {
                    return new PaymentResponse
                    {
                        Success = false,
                        ErrorMessage = "Failed to parse bKash response",
                        Message = "Payment initiation failed"
                    };
                }

                // PHP: if ($response['statusCode'] == "0000")
                if (apiResponse.StatusCode == "0000" && !string.IsNullOrEmpty(apiResponse.BkashUrl))
                {
                    return new PaymentResponse
                    {
                        Success = true,
                        PaymentId = apiResponse.PaymentId,
                        PaymentUrl = apiResponse.BkashUrl,
                        Status = apiResponse.StatusCode,
                        StatusMessage = apiResponse.StatusMessage,
                        Message = "Payment session created successfully"
                    };
                }

                // PHP: else return statusMessage
                return new PaymentResponse
                {
                    Success = false,
                    Status = apiResponse.StatusCode,
                    ErrorMessage = apiResponse.StatusMessage,
                    Message = apiResponse.StatusMessage ?? "Payment initiation failed"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initiating bKash payment");
                return new PaymentResponse
                {
                    Success = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }

        public async Task<PaymentResponse> ExecutePaymentAsync(string paymentId)
        {
            try
            {
                var appKey = _configuration["bKash:AppKey"] ?? string.Empty;
                var appSecret = _configuration["bKash:AppSecret"] ?? string.Empty;
                var username = _configuration["bKash:Username"] ?? string.Empty;
                var password = _configuration["bKash:Password"] ?? string.Empty;
                var baseUrl = _configuration["bKash:BaseUrl"] ?? "https://tokenized.sandbox.bka.sh/v1.2.0-beta";

                // PHP: getPaymentDetils($paymentID) - getAuthToken() first
                var token = await GetAccessTokenAsync(baseUrl, appKey, appSecret, username, password);
                if (string.IsNullOrEmpty(token))
                {
                    return new PaymentResponse
                    {
                        Success = false,
                        ErrorMessage = "Auth Failed"
                    };
                }

                // PHP: BKS_URL . '/execute' = baseUrl + "/tokenized/checkout/execute"
                // PHP: BKS_URL = 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout'
                var executeUrl = $"{baseUrl}/tokenized/checkout/execute";

                // PHP: POST with json_encode(['paymentID' => $paymentID])
                var executeRequest = new
                {
                    paymentID = paymentId
                };
                var jsonContent = JsonSerializer.Serialize(executeRequest);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                // PHP: Headers: Content-Type:application/json, Authorization:token, X-APP-Key:appKey
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", token);
                _httpClient.DefaultRequestHeaders.Add("X-APP-Key", appKey);

                var response = await _httpClient.PostAsync(executeUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("bKash Payment Execute Response: {Response}", responseContent);

                var apiResponse = JsonSerializer.Deserialize<BKashApiResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                // PHP: if ($response['statusCode'] == "0000")
                if (apiResponse?.StatusCode == "0000")
                {
                    return new PaymentResponse
                    {
                        Success = true,
                        PaymentId = apiResponse.PaymentId,
                        Status = apiResponse.StatusCode,
                        StatusMessage = apiResponse.StatusMessage
                    };
                }

                // PHP: else return statusMessage
                return new PaymentResponse
                {
                    Success = false,
                    Status = apiResponse?.StatusCode,
                    ErrorMessage = apiResponse?.StatusMessage,
                    Message = apiResponse?.StatusMessage
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing bKash payment");
                return new PaymentResponse
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<PaymentResponse> QueryPaymentAsync(string paymentId)
        {
            try
            {
                var appKey = _configuration["bKash:AppKey"] ?? string.Empty;
                var appSecret = _configuration["bKash:AppSecret"] ?? string.Empty;
                var username = _configuration["bKash:Username"] ?? string.Empty;
                var password = _configuration["bKash:Password"] ?? string.Empty;
                var baseUrl = _configuration["bKash:BaseUrl"] ?? "https://tokenized.sandbox.bka.sh/v1.2.0-beta";

                var token = await GetAccessTokenAsync(baseUrl, appKey, appSecret, username, password);
                if (string.IsNullOrEmpty(token))
                {
                    return new PaymentResponse
                    {
                        Success = false,
                        ErrorMessage = "Failed to get access token"
                    };
                }

                var queryUrl = $"{baseUrl}/tokenized/checkout/payment/query/{paymentId}";

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", token);
                _httpClient.DefaultRequestHeaders.Add("X-App-Key", appKey);

                var response = await _httpClient.GetAsync(queryUrl);
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("bKash Payment Query Response: {Response}", responseContent);

                var apiResponse = JsonSerializer.Deserialize<BKashApiResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (apiResponse?.StatusCode == "0000")
                {
                    return new PaymentResponse
                    {
                        Success = true,
                        PaymentId = apiResponse.PaymentId,
                        Status = apiResponse.StatusCode,
                        StatusMessage = apiResponse.StatusMessage
                    };
                }

                return new PaymentResponse
                {
                    Success = false,
                    Status = apiResponse?.StatusCode,
                    ErrorMessage = apiResponse?.ErrorMessage ?? apiResponse?.StatusMessage
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error querying bKash payment");
                return new PaymentResponse
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<bool> VerifyPaymentAsync(PaymentCallback callback)
        {
            try
            {
                if (string.IsNullOrEmpty(callback.PaymentId))
                {
                    return false;
                }

                var queryResponse = await QueryPaymentAsync(callback.PaymentId);
                return queryResponse.Success && queryResponse.Status == "0000";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying bKash payment");
                return false;
            }
        }

        private async Task<string?> GetAccessTokenAsync(string baseUrl, string appKey, string appSecret, string username, string password)
        {
            try
            {
                // PHP: getAuthToken() - BKS_URL . '/token/grant'
                // PHP: BKS_URL = 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout'
                // So: baseUrl + "/tokenized/checkout/token/grant"
                var tokenUrl = $"{baseUrl}/tokenized/checkout/token/grant";

                // PHP: json_encode(['app_key' => BKS_KEY, 'app_secret' => BKS_SEC])
                var requestData = new
                {
                    app_key = appKey,
                    app_secret = appSecret
                };

                var jsonContent = JsonSerializer.Serialize(requestData);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                // PHP Headers: Content-Type:application/json, username:, password:
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("username", username);
                _httpClient.DefaultRequestHeaders.Add("password", password);

                var response = await _httpClient.PostAsync(tokenUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("bKash Token Response: {Response}", responseContent);

                // PHP: if ($response['statusCode'] == "0000") return $response['id_token'];
                var tokenResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
                if (tokenResponse.TryGetProperty("statusCode", out var statusCode) &&
                    statusCode.GetString() == "0000" &&
                    tokenResponse.TryGetProperty("id_token", out var idToken))
                {
                    return idToken.GetString();
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bKash access token");
                return null;
            }
        }
    }
}