import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const DEFAULT_CURRENCY = {
    code: 'IDR',
    symbol: 'Rp',
    locale: 'id-ID',
}

const translations = {
    en: {
        menu_home: 'Home',
        menu_cars: 'Cars',
        menu_my_bookings: 'My Bookings',
        common_to: 'To',
        navbar_login: 'Login',
        navbar_logout: 'Logout',
        navbar_profile: 'Profile',
        navbar_search_placeholder: 'Search cars',
        navbar_guest_user: 'Guest User',
        banner_heading: 'Planning Your Next Trip?',
        banner_line1: 'Find the right car for business travel, weekend getaways, or daily rides.',
        banner_line2: 'Book from trusted vehicles with clear pricing, flexible durations, and secure online payment — all in one place.',
        banner_button: 'Find a car',
        featured_title: 'Featured Vehicles',
        featured_subtitle: 'Explore our selection of premium vehicles available for your next adventure.',
        featured_button: 'Explore all cars',
        footer_tagline: 'Premium Rent-A-Car service with a wide selection of luxury and everyday vehicles for all your driving needs.',
        footer_quick_links: 'Quick Links',
        footer_resources: 'Resources',
        footer_contact: 'Contact',
        footer_link_home: 'Home',
        footer_link_browse_cars: 'Browse Cars',
        footer_link_list_your_car: 'List Your Car',
        footer_link_about_us: 'About Us',
        footer_link_help_center: 'Help Center',
        footer_link_terms_of_service: 'Terms of Service',
        footer_link_privacy_policy: 'Privacy Policy',
        footer_link_insurance: 'Insurance',
        footer_contact_address_line1: '1234 Luxury Drive',
        footer_contact_address_line2: 'Jakarta Selatan, Indonesia',
        footer_contact_phone: '+62 8123 5557 6078',
        footer_contact_email: 'info@example.com',
        footer_link_privacy: 'Privacy',
        footer_link_terms: 'Terms',
        footer_link_cookies: 'Cookies',
        footer_copyright: 'All rights reserved.',
        car_card_available_now: 'Available Now',
        car_card_per_day: ' / day',
        car_card_seats: 'Seats',
        login_admin_url_not_configured: 'Admin dashboard URL is not configured',
        login_admin_redirect_success: 'Login successful, redirecting to admin dashboard',
        login_success: 'Login successful',
        login_verification_sent: 'Verification code sent to your email',
        login_enter_verification_code: 'Please enter the verification code',
        login_reset_email_sent: 'If the email is registered, a reset code has been sent',
        login_enter_reset_code: 'Please enter the reset code',
        login_fill_both_password_fields: 'Please fill both password fields',
        login_passwords_do_not_match: 'Passwords do not match',
        login_password_reset_success: 'Password reset successfully, please login',
        login_auth_failed: 'Authentication failed',
        login_title_login: 'Login',
        login_title_register: 'Sign Up',
        login_title_verify: 'Verify Email',
        login_title_forgot: 'Forgot Password',
        login_title_reset: 'Reset Password',
        login_label_email: 'Email',
        login_label_name: 'Name',
        login_label_password: 'Password',
        login_label_verification_code: 'Verification code',
        login_placeholder_type_here: 'type here',
        login_placeholder_verification_code: '6-digit code',
        login_hint_forgot_password: 'Forgot password?',
        login_hint_click_here: 'click here',
        login_verify_sent_hint: 'We sent a code to',
        login_forgot_hint: 'Enter your email to receive a password reset code.',
        login_label_reset_code: 'Reset code',
        login_label_new_password: 'New password',
        login_label_confirm_new_password: 'Confirm new password',
        login_text_already_have_account: 'Already have account?',
        login_text_create_account: 'Create an account?',
        login_text_back_to_login: 'Back to login',
        login_button_login: 'Login',
        login_button_create_account: 'Create Account',
        login_button_verify_email: 'Verify Email',
        login_button_send_code: 'Send Code',
        login_button_reset_password: 'Reset Password',
        hero_heading: 'Luxury cars on Rent',
        hero_pickup_location_label: 'Pickup Location',
        hero_select_location_placeholder: 'Select Location',
        hero_pickup_date_label: 'Pick-up Date',
        hero_return_date_label: 'Return Date',
        hero_search_button_mobile: 'Search Cars',
        hero_search_button_desktop: 'Search',
        hero_modal_title: 'Pickup location',
        hero_modal_province_city_label: 'Province / City',
        hero_modal_loading_locations: 'Loading locations...',
        hero_modal_select_province_city: 'Select province or city',
        hero_modal_my_location_button: 'My Location',
        hero_toast_pick_location_first: 'Please select pickup location first',
        hero_toast_geolocation_not_supported: 'Browser does not support geolocation',
        hero_toast_geolocation_failed: 'Failed to get your location',
        hero_current_location: 'Current Location',
        toast_session_expired: 'Session expired, please login again',
        toast_failed_load_cars: 'Failed to load cars',
        toast_logged_out: 'You have been logged out',
        car_details_toast_dates_required: 'Please select pickup and return dates',
        car_details_toast_times_invalid: 'Please select valid pickup and return times',
        car_details_toast_return_after_pickup: 'Return time must be after pickup time',
        car_details_toast_login_required: 'Please login or register before continuing',
        checkout_toast_invalid_booking: 'Invalid booking details. Please select a car first.',
        checkout_toast_car_not_found: 'Car details not found',
        checkout_toast_enter_coupon: 'Please enter a promo code',
        checkout_toast_coupon_applied: 'Coupon applied',
        checkout_toast_coupon_unavailable: 'Coupon is not available',
        checkout_toast_login_required: 'Please login or register before making a booking',
        checkout_toast_payment_success: 'Payment successful',
        checkout_toast_payment_pending: 'Payment pending',
        checkout_toast_payment_failed: 'Payment failed',
        checkout_toast_payment_popup_closed: 'Payment popup closed. You can pay later from My Bookings.',
        checkout_toast_payment_init_failed: 'Payment initialization failed',
        checkout_toast_payment_error: 'Payment Error',
        checkout_toast_booking_confirmed: 'Booking confirmed!',
        checkout_toast_booking_failed: 'Booking failed. Please try again.',
        booking_details_toast_failed_fetch: 'Failed to fetch booking details',
        booking_details_toast_login_required: 'Please login again to continue payment',
        booking_details_toast_payment_service_unavailable: 'Payment service is not available right now',
        booking_details_toast_payment_success: 'Payment successful',
        booking_details_toast_payment_pending: 'Payment pending, we will update your booking soon',
        booking_details_toast_payment_failed: 'Payment failed',
        booking_details_toast_payment_popup_closed: 'Payment popup was closed without completing the payment',
        booking_details_toast_payment_start_failed: 'Failed to start payment session',
        booking_details_toast_payment_init_failed: 'Payment initialization failed',
        my_bookings_toast_fetch_failed: 'Failed to fetch bookings',
        profile_toast_verification_sent: 'Verification code has been sent to your new email address.',
        profile_toast_update_failed: 'Failed to update profile',
        profile_toast_profile_updated: 'Profile updated',
        profile_toast_no_email_change: 'No email change in progress.',
        profile_toast_enter_verification_code: 'Please enter the verification code.',
        profile_toast_email_updated: 'Email updated successfully.',
        profile_toast_email_verify_failed: 'Failed to verify email change. Please check the code and try again.',
        profile_toast_rental_updated: 'Rental details updated',
        profile_toast_rental_update_failed: 'Failed to update rental details',
        profile_toast_password_fill_all: 'Please fill all password fields',
        profile_toast_password_mismatch: 'New password and confirmation do not match',
        profile_toast_password_updated: 'Password updated',
        profile_toast_password_update_failed: 'Failed to update password',
        profile_toast_avatar_not_image: 'Please upload an image file',
        profile_toast_avatar_updated: 'Photo updated',
        profile_toast_avatar_update_failed: 'Failed to update photo',
        checkout_back_button: 'Back',
        checkout_title: 'Checkout',
        checkout_subtitle: 'Review your trip details and complete your booking',
        checkout_primary_driver_heading: 'Primary driver',
        checkout_full_name_label: 'Full Name',
        checkout_full_name_placeholder: 'Enter full name',
        checkout_phone_label: 'Phone Number',
        checkout_phone_placeholder: 'Enter phone number',
        checkout_email_label: 'Email Address',
        checkout_email_placeholder: 'Enter email address',
        checkout_license_info: "After booking, you'll need to submit your driver's license for verification.",
        checkout_choose_when_to_pay_heading: 'Choose when to pay',
        checkout_pay_now_option: 'Pay now',
        checkout_pay_now_description: 'You will be redirected to Midtrans to complete your secure payment.',
        checkout_pay_later_option: 'Pay at pick-up',
        checkout_pay_later_description: 'Pay the full amount when you pick up the vehicle at the location.',
        checkout_payment_method_heading: 'Payment method',
        checkout_payment_method_gateway: 'Online Payment Gateway',
        checkout_terms_text: 'I agree to pay the total amount shown and to the',
        checkout_terms_link: 'Terms of Service',
        checkout_cancellation_link: 'Cancellation Policy',
        checkout_book_button_processing: 'Processing...',
        checkout_book_button: 'Book trip',
        checkout_price_days: 'days',
        checkout_price_protection_extras: 'Protection & Extras',
        checkout_price_coupon_discount: 'Coupon Discount',
        checkout_price_trip_total: 'Trip total',
        checkout_promo_toggle: 'Promo code',
        checkout_promo_label: 'Promo code',
        checkout_promo_placeholder: 'Enter promo code',
        checkout_promo_help: 'Only one promo code can be applied per trip. If multiple codes are added, only the last one will apply.',
        checkout_promo_button_checking: 'Checking...',
        checkout_promo_button_apply: 'Apply',
        cars_title: 'Available Cars',
        cars_subtitle_with_search: 'Showing cars based on your selected rental details',
        cars_subtitle_without_search: 'Browse our selection of premium vehicles available for your next adventure',
        cars_search_placeholder: 'Search by make, model, or features',
        cars_filters_title: 'All filters',
        cars_filter_category: 'Category',
        cars_filter_transmission: 'Transmission',
        cars_filter_fuel_type: 'Fuel type',
        cars_filter_province_city: 'Province / City',
        cars_filter_max_price: 'Max price / day',
        cars_filter_reset: 'Reset',
        cars_filter_show_cars_button: 'Show',
        cars_filter_show_cars_suffix: 'cars',
        cars_showing_cars_label: 'Showing',
        cars_showing_cars_suffix: 'Cars',
        my_bookings_title: 'My Bookings',
        my_bookings_subtitle: 'View and manage your all car bookings',
        my_bookings_login_prompt: 'Please log in or create an account to view your bookings.',
        my_bookings_badge_booking_number: 'Booking',
        my_bookings_rental_period: 'Rental Period',
        my_bookings_pickup_location_label: 'Pick-up Location',
        my_bookings_total_price: 'Total Price',
        my_bookings_booked_on: 'Booked on',
        my_bookings_view_details: 'View details',
        booking_details_loading: 'Loading booking details...',
        booking_details_back: 'Back',
        booking_details_not_found: 'Booking not found.',
        booking_details_back_to_bookings: 'Back to bookings',
        booking_details_heading: 'Booking Details',
        booking_details_subtitle: 'Review the details of your Rent-A-Car booking',
        booking_details_information_heading: 'Booking Information',
        booking_details_booking_id_label: 'Booking ID',
        booking_details_status_label: 'Status',
        booking_details_pickup_date_label: 'Pick-up Date',
        booking_details_dropoff_date_label: 'Drop-off Date',
        booking_details_pickup_location_label: 'Pick-up Location',
        booking_details_payment_method_label: 'Payment Method',
        booking_details_payment_method_online: 'Online payment',
        booking_details_payment_method_location: 'Pay at location',
        booking_details_payment_status_label: 'Payment Status',
        booking_details_payment_status_paid: 'Paid',
        booking_details_payment_status_pending: 'Pending',
        booking_details_payment_status_unpaid: 'Unpaid / Cancelled',
        booking_details_rental_duration: 'Rental Duration',
        booking_details_days_suffix: 'Days',
        booking_details_daily_rate: 'Daily Rate',
        booking_details_extras: 'Extras',
        booking_details_extras_included: 'Included',
        booking_details_insurance: 'Insurance',
        booking_details_insurance_included: 'Included',
        booking_details_total_amount: 'Total Amount',
        booking_details_download_receipt: 'Download Receipt',
        booking_details_pay_now_processing: 'Processing...',
        booking_details_pay_now: 'Pay Now',
        testimonial_title: 'What Our Customers Say',
        testimonial_subtitle: 'See why travelers across Indonesia trust us for a premium and reliable travel experience.',
        testimonial_1_location: 'Jakarta',
        testimonial_1_text: 'The entire rental experience was smooth and hassle-free. Highly impressed with the service quality!',
        testimonial_2_location: 'Sumedang',
        testimonial_2_text: 'Excellent cars and even better customer support! They made my trip extremely comfortable.',
        testimonial_3_location: 'Bandung',
        testimonial_3_text: 'Reliable, affordable, and premium quality service. I recommend them to everyone looking for Rent-A-Cars.',
        newsletter_title: 'Never Miss a Deal!',
        newsletter_subtitle: 'Subscribe to get the latest offers, new arrivals, and exclusive discounts.',
        newsletter_placeholder_email: 'Enter your email',
        newsletter_button_subscribe: 'Subscribe',
        home_scroll_hint: 'Scroll to see more',
        profile_tabs_personal: 'Personal information',
        profile_tabs_rental: 'Rental details',
        profile_tabs_security: 'Security',
        profile_title: 'Profile settings',
        profile_subtitle: 'Update your personal and company details here.',
        profile_overview_heading: 'Overview of your details',
        profile_picture_heading: 'Profile picture',
        profile_picture_subtitle: 'This photo is visible on the dashboard.',
        profile_picture_change_button: 'Change',
        profile_personal_section_heading: 'Personal information',
        profile_name_label: 'First name (Full Name)',
        profile_email_label: 'Email address',
        profile_phone_label: 'Phone number',
        profile_email_verification_label: 'Email verification code',
        profile_email_verification_placeholder: 'Enter verification code',
        profile_email_verification_button_verifying: 'Verifying',
        profile_email_verification_button_verify: 'Verify',
        profile_email_verification_help_prefix: 'We have sent a 6-digit code to',
        profile_email_verification_help_suffix: 'Enter the code to confirm your new email address.',
        profile_save_changes_button: 'Save changes',
        profile_rental_heading: 'Rental Details',
        profile_license_label: 'Driver License',
        profile_default_pickup_label: 'Default Pickup Location (Province)',
        profile_preferences_label: 'Rental Preferences',
        profile_save_details_button: 'Save Details',
        profile_security_heading: 'Security',
        profile_current_password_label: 'Current Password',
        profile_new_password_label: 'New Password',
        profile_confirm_new_password_label: 'Confirm New Password',
        profile_update_password_button: 'Update Password',
        extras_theft_label: 'Theft protection',
        extras_theft_description: 'Covers theft of the rental vehicle.',
        extras_collision_label: 'Collision damage waiver',
        extras_collision_description: 'Limits liability for damage to the vehicle.',
        extras_full_insurance_label: 'Full insurance',
        extras_full_insurance_description: 'Complete peace of mind coverage.',
        extras_driver_service_label: 'Driver service',
        extras_driver_service_description: 'Add a professional driver to your trip.',
        car_details_back_to_cars: 'Back to all cars',
        car_details_description_heading: 'Description',
        car_details_features_heading: 'Features',
        car_details_additional_services_heading: 'Additional Services',
        car_details_your_booking_details_heading: 'Your booking details',
        car_details_days_label: 'Days',
        car_details_pickup_label: 'Pickup',
        car_details_return_label: 'Return',
        car_details_estimated_total_label: 'Estimated Total',
        car_details_free_cancellation_prefix: 'Free cancellation before',
        car_details_free_cancellation_suffix: ', 10:00 AM',
        car_details_continue_button: 'Continue',
        car_details_select_dates_hint: 'Select pickup and return dates to see estimated price.',
    },
    id: {
        menu_home: 'Beranda',
        menu_cars: 'Mobil',
        menu_my_bookings: 'Pemesanan saya',
        common_to: 'sampai',
        navbar_login: 'Masuk',
        navbar_logout: 'Keluar',
        navbar_profile: 'Profil',
        navbar_search_placeholder: 'Cari mobil',
        navbar_guest_user: 'Pengguna Tamu',
        banner_heading: 'Merencanakan perjalanan berikutnya?',
        banner_line1: 'Temukan mobil yang tepat untuk bisnis, liburan, atau perjalanan harian.',
        banner_line2: 'Sewa mobil terpercaya dengan harga jelas, durasi fleksibel, dan pembayaran online yang aman dalam satu tempat.',
        banner_button: 'Cari mobil',
        featured_title: 'Mobil pilihan',
        featured_subtitle: 'Jelajahi pilihan mobil terbaik kami untuk perjalanan Anda berikutnya.',
        featured_button: 'Lihat semua mobil',
        footer_tagline: 'Layanan sewa mobil premium dengan berbagai pilihan mobil mewah dan harian untuk semua kebutuhan berkendara Anda.',
        footer_quick_links: 'Tautan cepat',
        footer_resources: 'Sumber daya',
        footer_contact: 'Kontak',
        footer_link_home: 'Beranda',
        footer_link_browse_cars: 'Cari mobil',
        footer_link_list_your_car: 'Daftarkan mobil Anda',
        footer_link_about_us: 'Tentang kami',
        footer_link_help_center: 'Pusat bantuan',
        footer_link_terms_of_service: 'Syarat layanan',
        footer_link_privacy_policy: 'Kebijakan privasi',
        footer_link_insurance: 'Asuransi',
        footer_contact_address_line1: 'Jalan Mewah 1234',
        footer_contact_address_line2: 'Jakarta Selatan, Indonesia',
        footer_contact_phone: '+62 8123 5557 6078',
        footer_contact_email: 'info@contoh.com',
        footer_link_privacy: 'Privasi',
        footer_link_terms: 'Ketentuan',
        footer_link_cookies: 'Cookie',
        footer_copyright: 'Hak cipta dilindungi.',
        car_card_available_now: 'Tersedia sekarang',
        car_card_per_day: ' / hari',
        car_card_seats: 'Kursi',
        login_admin_url_not_configured: 'URL dashboard admin belum dikonfigurasi',
        login_admin_redirect_success: 'Berhasil masuk, mengarahkan ke dashboard admin',
        login_success: 'Berhasil masuk',
        login_verification_sent: 'Kode verifikasi telah dikirim ke email Anda',
        login_enter_verification_code: 'Silakan masukkan kode verifikasi',
        login_reset_email_sent: 'Jika email terdaftar, kode reset telah dikirim',
        login_enter_reset_code: 'Silakan masukkan kode reset',
        login_fill_both_password_fields: 'Silakan isi kedua kolom kata sandi',
        login_passwords_do_not_match: 'Kata sandi tidak sama',
        login_password_reset_success: 'Kata sandi berhasil direset, silakan masuk',
        login_auth_failed: 'Autentikasi gagal',
        login_title_login: 'Masuk',
        login_title_register: 'Daftar',
        login_title_verify: 'Verifikasi Email',
        login_title_forgot: 'Lupa Kata Sandi',
        login_title_reset: 'Reset Kata Sandi',
        login_label_email: 'Email',
        login_label_name: 'Nama',
        login_label_password: 'Kata sandi',
        login_label_verification_code: 'Kode verifikasi',
        login_placeholder_type_here: 'ketik di sini',
        login_placeholder_verification_code: 'Kode 6 digit',
        login_hint_forgot_password: 'Lupa kata sandi?',
        login_hint_click_here: 'klik di sini',
        login_verify_sent_hint: 'Kami mengirim kode ke',
        login_forgot_hint: 'Masukkan email Anda untuk menerima kode reset kata sandi.',
        login_label_reset_code: 'Kode reset',
        login_label_new_password: 'Kata sandi baru',
        login_label_confirm_new_password: 'Konfirmasi kata sandi baru',
        login_text_already_have_account: 'Sudah punya akun?',
        login_text_create_account: 'Belum punya akun?',
        login_text_back_to_login: 'Kembali ke halaman masuk',
        login_button_login: 'Masuk',
        login_button_create_account: 'Buat akun',
        login_button_verify_email: 'Verifikasi email',
        login_button_send_code: 'Kirim kode',
        login_button_reset_password: 'Reset kata sandi',
        hero_heading: 'Sewa mobil mewah',
        hero_pickup_location_label: 'Lokasi penjemputan',
        hero_select_location_placeholder: 'Pilih lokasi',
        hero_pickup_date_label: 'Tanggal penjemputan',
        hero_return_date_label: 'Tanggal pengembalian',
        hero_search_button_mobile: 'Cari mobil',
        hero_search_button_desktop: 'Cari',
        hero_modal_title: 'Lokasi penjemputan',
        hero_modal_province_city_label: 'Provinsi / Kota',
        hero_modal_loading_locations: 'Memuat lokasi...',
        hero_modal_select_province_city: 'Pilih provinsi atau kota',
        hero_modal_my_location_button: 'Lokasi saya',
        hero_toast_pick_location_first: 'Silakan pilih lokasi penjemputan terlebih dahulu',
        hero_toast_geolocation_not_supported: 'Browser tidak mendukung geolokasi',
        hero_toast_geolocation_failed: 'Gagal mengambil lokasi Anda',
        hero_current_location: 'Lokasi saat ini',
        toast_session_expired: 'Sesi berakhir, silakan login kembali',
        toast_failed_load_cars: 'Gagal memuat mobil',
        toast_logged_out: 'Anda telah keluar',
        car_details_toast_dates_required: 'Silakan pilih tanggal penjemputan dan pengembalian',
        car_details_toast_times_invalid: 'Silakan pilih waktu penjemputan dan pengembalian yang valid',
        car_details_toast_return_after_pickup: 'Waktu pengembalian harus setelah waktu penjemputan',
        car_details_toast_login_required: 'Silakan masuk atau daftar sebelum melanjutkan',
        checkout_toast_invalid_booking: 'Detail pemesanan tidak valid. Silakan pilih mobil terlebih dahulu.',
        checkout_toast_car_not_found: 'Detail mobil tidak ditemukan',
        checkout_toast_enter_coupon: 'Silakan masukkan kode promo',
        checkout_toast_coupon_applied: 'Kupon berhasil diterapkan',
        checkout_toast_coupon_unavailable: 'Kupon tidak tersedia',
        checkout_toast_login_required: 'Silakan masuk atau daftar sebelum melakukan pemesanan',
        checkout_toast_payment_success: 'Pembayaran berhasil',
        checkout_toast_payment_pending: 'Pembayaran tertunda',
        checkout_toast_payment_failed: 'Pembayaran gagal',
        checkout_toast_payment_popup_closed: 'Jendela pembayaran ditutup. Anda dapat membayar nanti dari My Bookings.',
        checkout_toast_payment_init_failed: 'Gagal memulai pembayaran',
        checkout_toast_payment_error: 'Kesalahan pembayaran',
        checkout_toast_booking_confirmed: 'Pemesanan berhasil!',
        checkout_toast_booking_failed: 'Pemesanan gagal. Silakan coba lagi.',
        booking_details_toast_failed_fetch: 'Gagal mengambil detail pemesanan',
        booking_details_toast_login_required: 'Silakan masuk kembali untuk melanjutkan pembayaran',
        booking_details_toast_payment_service_unavailable: 'Layanan pembayaran sedang tidak tersedia',
        booking_details_toast_payment_success: 'Pembayaran berhasil',
        booking_details_toast_payment_pending: 'Pembayaran tertunda, kami akan memperbarui status pemesanan Anda',
        booking_details_toast_payment_failed: 'Pembayaran gagal',
        booking_details_toast_payment_popup_closed: 'Jendela pembayaran ditutup tanpa menyelesaikan pembayaran',
        booking_details_toast_payment_start_failed: 'Gagal memulai sesi pembayaran',
        booking_details_toast_payment_init_failed: 'Gagal memulai pembayaran',
        my_bookings_toast_fetch_failed: 'Gagal mengambil data pemesanan',
        profile_toast_verification_sent: 'Kode verifikasi telah dikirim ke email baru Anda.',
        profile_toast_update_failed: 'Gagal memperbarui profil',
        profile_toast_profile_updated: 'Profil berhasil diperbarui',
        profile_toast_no_email_change: 'Tidak ada perubahan email yang sedang diproses.',
        profile_toast_enter_verification_code: 'Silakan masukkan kode verifikasi.',
        profile_toast_email_updated: 'Email berhasil diperbarui.',
        profile_toast_email_verify_failed: 'Gagal memverifikasi perubahan email. Periksa kode lalu coba lagi.',
        profile_toast_rental_updated: 'Detail penyewaan berhasil diperbarui',
        profile_toast_rental_update_failed: 'Gagal memperbarui detail penyewaan',
        profile_toast_password_fill_all: 'Silakan isi semua kolom kata sandi',
        profile_toast_password_mismatch: 'Kata sandi baru dan konfirmasi tidak sama',
        profile_toast_password_updated: 'Kata sandi berhasil diperbarui',
        profile_toast_password_update_failed: 'Gagal memperbarui kata sandi',
        profile_toast_avatar_not_image: 'Silakan unggah file gambar',
        profile_toast_avatar_updated: 'Foto berhasil diperbarui',
        profile_toast_avatar_update_failed: 'Gagal memperbarui foto',
        checkout_back_button: 'Kembali',
        checkout_title: 'Checkout',
        checkout_subtitle: 'Periksa detail perjalanan Anda dan selesaikan pemesanan',
        checkout_primary_driver_heading: 'Pengemudi utama',
        checkout_full_name_label: 'Nama lengkap',
        checkout_full_name_placeholder: 'Masukkan nama lengkap',
        checkout_phone_label: 'Nomor telepon',
        checkout_phone_placeholder: 'Masukkan nomor telepon',
        checkout_email_label: 'Alamat email',
        checkout_email_placeholder: 'Masukkan alamat email',
        checkout_license_info: 'Setelah pemesanan, Anda perlu mengirimkan SIM untuk verifikasi.',
        checkout_choose_when_to_pay_heading: 'Pilih waktu pembayaran',
        checkout_pay_now_option: 'Bayar sekarang',
        checkout_pay_now_description: 'Anda akan diarahkan ke Midtrans untuk menyelesaikan pembayaran dengan aman.',
        checkout_pay_later_option: 'Bayar saat penjemputan',
        checkout_pay_later_description: 'Bayar penuh ketika mengambil kendaraan di lokasi.',
        checkout_payment_method_heading: 'Metode pembayaran',
        checkout_payment_method_gateway: 'Gateway Pembayaran Online',
        checkout_terms_text: 'Saya setuju membayar total yang tertera dan dengan',
        checkout_terms_link: 'Syarat Layanan',
        checkout_cancellation_link: 'Kebijakan Pembatalan',
        checkout_book_button_processing: 'Memproses...',
        checkout_book_button: 'Pesan perjalanan',
        checkout_price_days: 'hari',
        checkout_price_protection_extras: 'Proteksi & Tambahan',
        checkout_price_coupon_discount: 'Diskon kupon',
        checkout_price_trip_total: 'Total perjalanan',
        checkout_promo_toggle: 'Kode promo',
        checkout_promo_label: 'Kode promo',
        checkout_promo_placeholder: 'Masukkan kode promo',
        checkout_promo_help: 'Hanya satu kode promo yang dapat digunakan per perjalanan. Jika beberapa kode dimasukkan, hanya kode terakhir yang digunakan.',
        checkout_promo_button_checking: 'Memeriksa...',
        checkout_promo_button_apply: 'Terapkan',
        cars_title: 'Mobil tersedia',
        cars_subtitle_with_search: 'Menampilkan mobil berdasarkan detail sewa yang Anda pilih',
        cars_subtitle_without_search: 'Jelajahi pilihan mobil terbaik kami untuk perjalanan Anda',
        cars_search_placeholder: 'Cari berdasarkan merk, model, atau fitur',
        cars_filters_title: 'Semua filter',
        cars_filter_category: 'Kategori',
        cars_filter_transmission: 'Transmisi',
        cars_filter_fuel_type: 'Jenis bahan bakar',
        cars_filter_province_city: 'Provinsi / Kota',
        cars_filter_max_price: 'Harga maksimal / hari',
        cars_filter_reset: 'Atur ulang',
        cars_filter_show_cars_button: 'Tampilkan',
        cars_filter_show_cars_suffix: 'mobil',
        cars_showing_cars_label: 'Menampilkan',
        cars_showing_cars_suffix: 'Mobil',
        my_bookings_title: 'Pemesanan saya',
        my_bookings_subtitle: 'Lihat dan kelola semua pemesanan mobil Anda',
        my_bookings_login_prompt: 'Silakan masuk atau buat akun untuk melihat pemesanan Anda.',
        my_bookings_badge_booking_number: 'Pemesanan',
        my_bookings_rental_period: 'Periode sewa',
        my_bookings_pickup_location_label: 'Lokasi penjemputan',
        my_bookings_total_price: 'Total harga',
        my_bookings_booked_on: 'Dipesan pada',
        my_bookings_view_details: 'Lihat detail',
        booking_details_loading: 'Memuat detail pemesanan...',
        booking_details_back: 'Kembali',
        booking_details_not_found: 'Pemesanan tidak ditemukan.',
        booking_details_back_to_bookings: 'Kembali ke daftar pemesanan',
        booking_details_heading: 'Detail pemesanan',
        booking_details_subtitle: 'Periksa detail pemesanan Rent-A-Car Anda',
        booking_details_information_heading: 'Informasi pemesanan',
        booking_details_booking_id_label: 'ID pemesanan',
        booking_details_status_label: 'Status',
        booking_details_pickup_date_label: 'Tanggal penjemputan',
        booking_details_dropoff_date_label: 'Tanggal pengembalian',
        booking_details_pickup_location_label: 'Lokasi penjemputan',
        booking_details_payment_method_label: 'Metode pembayaran',
        booking_details_payment_method_online: 'Pembayaran online',
        booking_details_payment_method_location: 'Bayar di lokasi',
        booking_details_payment_status_label: 'Status pembayaran',
        booking_details_payment_status_paid: 'Lunas',
        booking_details_payment_status_pending: 'Tertunda',
        booking_details_payment_status_unpaid: 'Belum dibayar / Dibatalkan',
        booking_details_rental_duration: 'Durasi sewa',
        booking_details_days_suffix: 'Hari',
        booking_details_daily_rate: 'Tarif harian',
        booking_details_extras: 'Tambahan',
        booking_details_extras_included: 'Termasuk',
        booking_details_insurance: 'Asuransi',
        booking_details_insurance_included: 'Termasuk',
        booking_details_total_amount: 'Total pembayaran',
        booking_details_download_receipt: 'Unduh struk',
        booking_details_pay_now_processing: 'Memproses...',
        booking_details_pay_now: 'Bayar sekarang',
        profile_tabs_personal: 'Informasi pribadi',
        profile_tabs_rental: 'Detail penyewaan',
        profile_tabs_security: 'Keamanan',
        profile_title: 'Pengaturan profil',
        profile_subtitle: 'Perbarui detail pribadi dan perusahaan Anda di sini.',
        profile_overview_heading: 'Ringkasan data Anda',
        profile_picture_heading: 'Foto profil',
        profile_picture_subtitle: 'Foto ini akan terlihat di dashboard.',
        profile_picture_change_button: 'Ubah',
        profile_personal_section_heading: 'Informasi pribadi',
        profile_name_label: 'Nama lengkap',
        profile_email_label: 'Alamat email',
        profile_phone_label: 'Nomor telepon',
        profile_email_verification_label: 'Kode verifikasi email',
        profile_email_verification_placeholder: 'Masukkan kode verifikasi',
        profile_email_verification_button_verifying: 'Memverifikasi',
        profile_email_verification_button_verify: 'Verifikasi',
        profile_email_verification_help_prefix: 'Kami telah mengirim kode 6 digit ke',
        profile_email_verification_help_suffix: 'Masukkan kode untuk mengonfirmasi email baru Anda.',
        profile_save_changes_button: 'Simpan perubahan',
        profile_rental_heading: 'Detail penyewaan',
        profile_license_label: 'SIM',
        profile_default_pickup_label: 'Lokasi penjemputan default (Provinsi)',
        profile_preferences_label: 'Preferensi penyewaan',
        profile_save_details_button: 'Simpan detail',
        profile_security_heading: 'Keamanan',
        profile_current_password_label: 'Kata sandi saat ini',
        profile_new_password_label: 'Kata sandi baru',
        profile_confirm_new_password_label: 'Konfirmasi kata sandi baru',
        profile_update_password_button: 'Perbarui kata sandi',
        extras_theft_label: 'Perlindungan pencurian',
        extras_theft_description: 'Menanggung kehilangan kendaraan sewaan jika dicuri.',
        extras_collision_label: 'Perlindungan kerusakan',
        extras_collision_description: 'Mengurangi tanggung jawab finansial atas kerusakan kendaraan sewaan.',
        extras_full_insurance_label: 'Asuransi penuh',
        extras_full_insurance_description: 'Perlindungan lengkap termasuk pencurian, tabrakan, dan pihak ketiga.',
        extras_driver_service_label: 'Layanan sopir',
        extras_driver_service_description: 'Termasuk sopir profesional selama masa sewa.',
        testimonial_title: 'Apa Kata Pelanggan Kami',
        testimonial_subtitle: 'Lihat mengapa pelancong di seluruh Indonesia mempercayai kami untuk pengalaman sewa yang premium dan terpercaya.',
        testimonial_1_location: 'Jakarta',
        testimonial_1_text: 'Pengalaman sewa mobilnya sangat mulus dan tanpa ribet. Saya sangat terkesan dengan kualitas layanannya!',
        testimonial_2_location: 'Sumedang',
        testimonial_2_text: 'Mobilnya bagus dan layanan pelanggan yang ramah. Perjalanan saya jadi jauh lebih nyaman.',
        testimonial_3_location: 'Bandung',
        testimonial_3_text: 'Layanan terpercaya, harga terjangkau, dan kualitas premium. Sangat saya rekomendasikan untuk sewa mobil.',
        newsletter_title: 'Jangan Lewatkan Promo!',
        newsletter_subtitle: 'Berlangganan untuk mendapatkan penawaran terbaru, mobil baru, dan diskon eksklusif.',
        newsletter_placeholder_email: 'Masukkan email Anda',
        newsletter_button_subscribe: 'Berlangganan',
        car_details_back_to_cars: 'Kembali ke semua mobil',
        car_details_description_heading: 'Deskripsi',
        car_details_features_heading: 'Fitur',
        car_details_additional_services_heading: 'Layanan tambahan',
        car_details_your_booking_details_heading: 'Detail pemesanan Anda',
        car_details_days_label: 'Hari',
        car_details_pickup_label: 'Penjemputan',
        car_details_return_label: 'Pengembalian',
        car_details_estimated_total_label: 'Perkiraan total',
        car_details_free_cancellation_prefix: 'Pembatalan gratis sebelum',
        car_details_free_cancellation_suffix: ', 10.00',
        car_details_continue_button: 'Lanjutkan',
        car_details_select_dates_hint: 'Pilih tanggal penjemputan dan pengembalian untuk melihat estimasi harga.',
    },
};

export const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const navigate = useNavigate()
    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const [showLogin, setShowLogin] = useState(false)
    const [pickupDate, setPickupDate] = useState('')
    const [returnDate, setReturnDate] = useState('')
    const [language, setLanguage] = useState('en')

    const [cars, setCars] = useState([])

    const mapCarFromApi = (car) => {
        const locationObj = car.location || {}
        const locationName =
            locationObj.city ||
            locationObj.name ||
            locationObj.address ||
            ''
        const provinceName = locationObj.city || ''
        const countryName = locationObj.country || ''

        const imageRecords = Array.isArray(car.images) ? car.images : []
        const imageUrls = imageRecords.map((img) => img.image_url)
        const primaryImage =
            imageRecords.find((img) => img.is_primary)?.image_url ||
            imageUrls[0] ||
            car.photo_url ||
            ''

        return {
            id: car.id,
            brand: car.brand,
            model: car.model,
            year: car.year,
            category: car.category,
            transmission: car.transmission,
            fuel_type: car.fuel_type,
            seating_capacity: car.seating_capacity,
            pricePerDay: Number(car.price_per_day),
            image: primaryImage,
            images: imageUrls,
            location: locationName,
            province: provinceName,
            country: countryName,
            locationId: car.location_id,
            isAvaliable: car.status === 'available',
            description: car.description,
            features: Array.isArray(car.features) ? car.features : [],
        }
    }

    const t = (key) => {
        const dict = translations[language] || translations.en
        return dict[key] || key
    }

    const fetchUser = async () => {
        try {
            const { data } = await axios.get('/api/user/data')
            setUser(data)
        } catch (error) {
            console.error('Failed to fetch user', error)
            toast.error(t('toast_session_expired'))
            logout()
        }
    }

    const fetchCars = async () => {
        try {
            const { data } = await axios.get('/api/user/cars')
            const list = Array.isArray(data) ? data.map(mapCarFromApi) : []
            setCars(list)
        } catch (error) {
            console.error('Failed to fetch cars', error)
            toast.error(t('toast_failed_load_cars'))
        }
    }

    const formatCurrency = (value) => {
        const number = Number(value) || 0

        if (!number) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
            }).format(0)
        }

        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(Math.round(number))
    }

    const currency = DEFAULT_CURRENCY.symbol

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        axios.defaults.headers.common['Authorization'] = ''
        toast.success(t('toast_logged_out'))
        navigate('/')
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedLanguage = localStorage.getItem('language')
            if (storedLanguage) {
                setLanguage(storedLanguage)
            }
        }
    }, [])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const shouldLogout = params.get('logout') === '1'
            if (shouldLogout) {
                logout()
                params.delete('logout')
                const newSearch = params.toString()
                const newUrl = window.location.origin + window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash
                window.history.replaceState(null, '', newUrl)
                fetchCars()
                return
            }
            const storedToken = localStorage.getItem('token')
            if (storedToken) {
                setToken(storedToken)
            }
        }
        fetchCars()
    }, [])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('language', language)
        }
    }, [language])

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            fetchUser()
        }
    }, [token])

    const value = {
        navigate, currency, axios, user, setUser,
        token, setToken, fetchUser, showLogin, setShowLogin, logout, fetchCars, cars, setCars,
        pickupDate, setPickupDate, returnDate, setReturnDate,
        formatCurrency,
        language, setLanguage, t,
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    return useContext(AppContext)
}
