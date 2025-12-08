from django.urls import path
from .auth import login, register, logout, google_auth, forget_password, profile
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from . import views
from .auth.email_sending_preference import ProfileEmailPreferenceView
from .auth.delete_account import DeleteAccountView
from accounts.push_subscription import PushSubscriptionView

urlpatterns = [

    path('user-data/', views.user_view, name='user_data'),

    # Authentication endpoints
    path('auth/login/', login.LoginView.as_view(), name='login'),
    path('auth/logout/', logout.LogoutView.as_view(), name='logout'),
    path('auth/register/', register.RegisterView.as_view(), name='register'),
    path('auth/verify-email/', register.VerifyEmailView.as_view(), name='verify_email'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Password Reset endpoints
    path('auth/password-reset/', forget_password.PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password-reset/confirm/', forget_password.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/password-reset/validate/', forget_password.PasswordResetValidateView.as_view(), name='password_reset_validate'),

    # Google OAuth endpoints
    path('auth/google/url/', google_auth.GoogleLoginUrlView.as_view(), name='google_login_url'),
    path('auth/google/authenticate/', google_auth.GoogleAuthView.as_view(), name='google_auth'),
    path('auth/google/callback/', google_auth.GoogleCallbackView.as_view(), name='google_callback'),
    path('auth/google/set-user-type/', google_auth.SetUserTypeView.as_view(), name='set_user_type'),

    # Profile endpoints
    path('profile/', profile.GetProfileView.as_view(), name='get_profile'),
    path('profile/update/', profile.UpdateProfileView.as_view(), name='update_profile'),
    path('profile/change-password/', profile.ChangePasswordView.as_view(), name='change_password'),
    path('profile/verify-email-change/', profile.VerifyEmailChangeView.as_view(), name='verify_email_change'),
    
    path('profile/email-preferences/', ProfileEmailPreferenceView.as_view(), name='email_preferences'),
    path('auth/delete-account/', DeleteAccountView.as_view(), name='delete_account'),
    path('push/subscribe/', PushSubscriptionView.as_view(), name='push-subscribe'),

]
