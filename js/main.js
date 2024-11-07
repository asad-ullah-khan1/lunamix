$(document).ready(function () {
    const form = $('.contact__form');
    const submitButton = form.find('button[type="submit"]');

    // Add loading spinner to button
    const originalButtonText = submitButton.text();
    function setLoadingState(isLoading) {
        if (isLoading) {
            submitButton.html('<span class="spinner"></span> Sending...').prop('disabled', true);
        } else {
            submitButton.html(originalButtonText).prop('disabled', false);
        }
    }

    // Show notification with debounce
    const showNotification = (() => {
        let currentNotification = null;

        return (message, isSuccess) => {
            // Remove existing notification if present
            if (currentNotification) {
                currentNotification.removeClass('show');
                setTimeout(() => currentNotification.remove(), 300);
            }

            const notification = $(`
                <div class="notification ${isSuccess ? 'success' : 'error'}">
                    ${message}
                    <button class="close-notification">&times;</button>
                </div>
            `);

            currentNotification = notification;

            $('body').append(notification);
            setTimeout(() => notification.addClass('show'), 100);

            setTimeout(() => {
                notification.removeClass('show');
                setTimeout(() => notification.remove(), 300);
                currentNotification = null;
            }, 5000);

            notification.find('.close-notification').on('click', function () {
                notification.removeClass('show');
                setTimeout(() => notification.remove(), 300);
                currentNotification = null;
            });
        };
    })();

    // Form validation with better error handling
    function validateForm() {
        const name = $('#name').val().trim();
        const email = $('#email').val().trim();
        const message = $('#message').val().trim();
        let isValid = true;

        $('.form-input').removeClass('error');
        $('.error-message').remove();

        function showError(field, message) {
            field.addClass('error')
                .after(`<span class="error-message">${message}</span>`);
            isValid = false;
        }

        // Enhanced validation
        if (!name) {
            showError($('#name'), 'Name is required');
        } else if (name.length < 2) {
            showError($('#name'), 'Please enter your full name');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            showError($('#email'), 'Email is required');
        } else if (!emailRegex.test(email)) {
            showError($('#email'), 'Please enter a valid email address');
        }

        if (!message) {
            showError($('#message'), 'Message is required');
        } else if (message.length < 10) {
            showError($('#message'), 'Please enter a detailed message (at least 10 characters)');
        }

        return isValid;
    }

    // Form submission handler with improved error handling
    form.on('submit', function (e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const formData = {
            name: $('#name').val().trim(),
            email: $('#email').val().trim(),
            message: $('#message').val().trim()
        };

        setLoadingState(true);

        $.ajax({
            url: 'process-form.php',
            type: 'POST',
            data: formData,
            timeout: 10000, // 10 second timeout
            success: function (response) {
                try {
                    const result = JSON.parse(response);
                    if (result.success) {
                        showNotification('Thank you! Your message has been sent.', true);
                        form[0].reset();
                    } else {
                        throw new Error(result.message || 'Failed to send message');
                    }
                } catch (error) {
                    showNotification(error.message || 'Sorry, there was an error processing your message.', false);
                    console.error('Form submission error:', error);
                }
            },
            error: function (xhr, status, error) {
                let errorMessage = 'Sorry, there was an error sending your message.';
                if (status === 'timeout') {
                    errorMessage = 'Request timed out. Please try again.';
                }
                showNotification(errorMessage, false);
                console.error('Ajax error:', status, error);
            },
            complete: function () {
                setLoadingState(false);
            }
        });
    });

    // Smooth scroll with improved performance
    $('a[href^="#"]').on('click', function (e) {
        e.preventDefault();
        const target = $(this.hash);
        if (target.length) {
            const offset = target.offset().top - 80;
            $('html, body').animate({
                scrollTop: offset
            }, {
                duration: 800,
                easing: 'easeInOutQuad'
            });
        }
    });

    // Navbar scroll effect with throttle
    let lastScroll = 0;
    let ticking = false;

    $(window).on('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                const currentScroll = $(window).scrollTop();

                if (currentScroll > lastScroll && currentScroll > 80) {
                    $('.navbar').addClass('navbar--hidden');
                } else {
                    $('.navbar').removeClass('navbar--hidden');
                }

                lastScroll = currentScroll;
                ticking = false;
            });

            ticking = true;
        }
    });
});