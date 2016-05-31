var requests = (function() {
    var errorBlock = $('#errors');

    var showError =  function (text){
        errorBlock
            .hide()
            .css({
                'color' : 'firebrick',
                'margin-bottom' : '10px',
                'position' : 'relative',
                'z-index' : '10',
                'text-align' : 'center'
            })
            .text(text)
            .fadeIn();
    }

    return {
        enter : function () {
            $('#enter-btn').on('click', function(e){
                e.preventDefault();

                var
                    $this = $(this),
                    container = $this.closest('.auth__block-side'),
                    form = container.find('.login__form').serialize();

                if ($('#human').is(':checked') && $('#yes').is(':checked')) {
                    $.post('/auth', form, function (data) {
                        if (data.error) {

                            showError(data.error);
                        } else {
                            window.location = '/admin/about.html'
                        }
                    }, 'json');
                } else {
                    showError('Роботам тут не место!');
                }
            });
        },
        
        mail : function () {
            $('.reviews__form-elem').on('submit', function(e){
                e.preventDefault();

                var
                    form = $(this),
                    data = form.serialize(),
                    container = form.closest('.reviews__form');

                    $.post('/mail', data, function (data) {
                        if (data.error) {
                            showError(data.error);
                        } else {
                            container.addClass('active');
                            form.trigger('reset');

                            container.find('.form__env').on('transitionend', function() {
                                setTimeout(function () {
                                    container.removeClass('active');
                                }, 500)
                            });
                        }
                    }, 'json');
            });
        }
    }


}());

$(document).ready(function(){
    requests.enter();
    requests.mail();
    
}); // -> ready_end;