$(document).ready(function () {
  function showThemedAlert(message, title) {
    let alertDialog = document.getElementById('successAlert');

    if (!alertDialog) {
      alertDialog = document.createElement('dialog');
      alertDialog.id = 'successAlert';
      alertDialog.className = 'lotm-alert';
      alertDialog.setAttribute('aria-labelledby', 'successAlertTitle');
      alertDialog.innerHTML = `
        <div class="lotm-alert-icon" aria-hidden="true"><i class="bi bi-eye"></i></div>
        <h2 id="successAlertTitle" class="lotm-alert-title">Login Is Complete</h2>
        <p class="lotm-alert-message"></p>
        <button type="button" class="lotm-btn lotm-alert-button">Continue</button>
      `;
      alertDialog.querySelector('button').addEventListener('click', function () {
        alertDialog.close();
      });
      document.body.appendChild(alertDialog);
    }

    alertDialog.querySelector('.lotm-alert-title').textContent = title;
    alertDialog.querySelector('.lotm-alert-message').textContent = message;
    alertDialog.showModal();
    alertDialog.querySelector('button').focus();
  }

  $.validator.setDefaults({
    errorClass: 'is-invalid',
    validClass: 'is-valid',
    errorElement: 'div',
    errorPlacement: function (error, element) {
      error.addClass('invalid-feedback d-block');
      element.closest('.mb-3').append(error);
    }
  });

  // Valid Name and Password for Login
  const validUserName = "Gian Admin";
  const validPassword = "Gianadmin@7947";
  
  const maxFailedPasswordAttempts = 4;
  const loginCooldownSeconds = 12;
  let failedPasswordAttempts = 0;
  let loginCooldownRemaining = 0;
  let loginCooldownInterval;

  function disableLoginButton() {
    $('#loginForm button[type="submit"]').prop('disabled', true).addClass('disabled');
  }

  function startLoginCooldown() {
    const loginButton = $('#loginForm button[type="submit"]');
    loginCooldownRemaining = loginCooldownSeconds;
    disableLoginButton();
    loginButton.addClass('cooldown');
    loginButton.text(`Try again in ${loginCooldownRemaining}s`);

    loginCooldownInterval = window.setInterval(function () {
      loginCooldownRemaining -= 1;

      if (loginCooldownRemaining <= 0) {
        window.clearInterval(loginCooldownInterval);
        loginCooldownRemaining = 0;
        failedPasswordAttempts = 0;
        loginButton.prop('disabled', false).removeClass('disabled cooldown').text('Login');
        return;
      }

      loginButton.text(`Try again in ${loginCooldownRemaining}s`);
    }, 1000);
  }

  function handleFailedPasswordAttempt() {
    if (failedPasswordAttempts >= maxFailedPasswordAttempts) {
      return;
    }

    failedPasswordAttempts += 1;

    if (failedPasswordAttempts >= maxFailedPasswordAttempts) {
      startLoginCooldown();
      $('#loginPassword').addClass('is-invalid').removeClass('is-valid');
      showThemedAlert('You have entered the wrong password 4 times. Please wait 12 seconds before trying again.', 'Access Denied');
      return;
    }

    showThemedAlert(`Incorrect login attempt ${failedPasswordAttempts} of ${maxFailedPasswordAttempts}.`, 'Access Denied');
  }

  $.validator.addMethod('validLoginInput', function (value) {
    return value.trim().length >= 4 && (value.includes('@') ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : true);
  }, 'Please enter a valid username or email address.');

  $.validator.addMethod('validLoginUsername', function (value) {
    return value.trim() === validUserName;
  }, 'Username is incorrect.');

  $.validator.addMethod('strongPassword', function (value) {
    return /^(?=.*[A-Z])(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);
  }, 'Password must be at least 8 characters and include at least one uppercase letter, one number, and one special character.');

  $.validator.addMethod('validLoginPassword', function (value) {
    return value === validPassword;
  }, 'Password is incorrect.');

  $.validator.addMethod('validPhone', function (value) {
    return /^[+]?[(]?[0-9]{1,4}[)]?[-\s0-9]*$/.test(value) && value.replace(/\D/g, '').length >= 10;
  }, 'Please enter a valid phone number.');

  $('#loginForm').validate({
    rules: {
      honorificName: {
        required: true,
        validLoginInput: true,
        validLoginUsername: true
      },
      loginPassword: {
        required: true,
        strongPassword: true,
        validLoginPassword: true
      }
    },
    messages: {
      honorificName: {
        required: 'Username or Email is required'
      },
      loginPassword: {
        required: 'Password is required'
      }
    },
    invalidHandler: function (event, validator) {
      if (loginCooldownRemaining > 0) {
        return;
      }

      const usernameValue = $('#honorificName').val();
      const passwordValue = $('#loginPassword').val();

      if (!usernameValue || !usernameValue.trim() || !passwordValue || !passwordValue.trim()) {
        return;
      }

      if (passwordValue !== validPassword) {
        handleFailedPasswordAttempt();
      }
    },
    submitHandler: function (form) {
      if (loginCooldownRemaining > 0) {
        showThemedAlert(`Please wait ${loginCooldownRemaining} seconds before trying again.`, 'Login Cooldown');
        return false;
      }

      const userName = form.elements.honorificName.value.trim();
      const password = form.elements.loginPassword.value;

      if (userName !== validUserName || password !== validPassword) {
        showThemedAlert('The username or password is incorrect.', 'Access Denied');
        return false;
      }

      failedPasswordAttempts = 0;
  sessionStorage.setItem('loginWelcomePending', 'true');
      form.reset();
      $(form).find('input').removeClass('is-valid is-invalid');
      window.location.href = 'index.html';
    }
  });

  $('#registerForm').validate({
    rules: {
      regUsername: {
        required: true,
        minlength: 4,
        maxlength: 20
      },
      regEmail: {
        required: true,
        email: true
      },
      regPhoneNum: {
        required: true,
        validPhone: true
      },
      regPassword: {
        required: true,
        strongPassword: true        
      }
    },
    messages: {
      regUsername: {
        required: 'Username is required.',
        minlength: 'Username must be at least 4 characters long'
      },
      regEmail: {
        required: 'Email is required.',
        email: 'Please enter a valid email address'
      },
      regPhoneNum: {
        required: 'Phone number is required'
      },
      regPassword: {
        required: 'Password is required'
      }
    },
    submitHandler: function (form) {
      showThemedAlert('Registration successful. Your account has been created.');
      form.reset();
      $(form).find('input').removeClass('is-valid');
      window.setTimeout(function () {
        window.location.href = 'login.html';
      }, 1500);
    }
  });
});