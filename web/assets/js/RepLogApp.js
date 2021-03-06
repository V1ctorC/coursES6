'use strict';

(function(window, $, Routing, swal) {
    window.RepLogApp = function ($wrapper) {
        this.$wrapper = $wrapper;
        this.helper = new Helper(this.$wrapper);

        this.loadRepLogs();

        this.$wrapper.on(
            'click',
            '.js-delete-rep-log',
            this.handleRepLogDelete.bind(this)
        );
        this.$wrapper.on(
            'click',
            'tbody tr',
            this.handleRowClick.bind(this)
        );
        this.$wrapper.on(
            'submit',
            this._selectors.newRepForm,
            this.handleNewFormSubmit.bind(this)
        );
    };

    $.extend(window.RepLogApp.prototype, {
        _selectors: {
            newRepForm: '.js-new-rep-log-form'
        },

        loadRepLogs: function() {
            $.ajax({
                url: Routing.generate('rep_log_list'),
            }).then(data => {
                $.each(data.items, function(key, repLog) {
                    this._addRow(repLog);
                });
            })
        },

        updateTotalWeightLifted: function () {
            this.$wrapper.find('.js-total-weight').html(
                this.helper.calculateTotalWeight()
            );
        },

        handleRepLogDelete: function (e) {
            e.preventDefault();

            const $link = $(e.currentTarget);

            swal({
                title: 'Delete this log?',
                text: 'What? Did you not actually lift this?',
                showCancelButton: true,
                showLoaderOnConfirm: true,
                preConfirm: () => this._deleteRepLog($link)

            }).catch(arg => {
                // canceling is cool!
            });
        },

        _deleteRepLog: function($link) {
            $link.addClass('text-danger');
            $link.find('.fa')
                .removeClass('fa-trash')
                .addClass('fa-spinner')
                .addClass('fa-spin');

            const deleteUrl = $link.data('url');
            const $row = $link.closest('tr');

            return $.ajax({
                url: deleteUrl,
                method: 'DELETE'
            }).then(() => {
                $row.fadeOut('normal',() => {
                    $row.remove();
                    this.updateTotalWeightLifted();
                });
            })
        },

        handleRowClick: function () {
            console.log('row clicked!');
        },

        handleNewFormSubmit: function(e) {
            e.preventDefault();

            const $form = $(e.currentTarget);
            const formData = {};
            $.each($form.serializeArray(), (key, fieldData) => {
                formData[fieldData.name] = fieldData.value
            });
            const self = this;
            this._saveRepLog(formData)
            .then(data => {
                this._clearForm();
                this._addRow(data);
            }).catch(function(errorData) {
                this._mapErrorsToForm(errorData.errors);
            });
        },

        _saveRepLog: function(data) {
            return new Promise(function(resolve, reject) {
                $.ajax({
                    url: Routing.generate('rep_log_new'),
                    method: 'POST',
                    data: JSON.stringify(data)
                }).then(function(data, textStatus, jqXHR) {
                    $.ajax({
                        url: jqXHR.getResponseHeader('Location')
                    }).then(function(data) {
                        // we're finally done!
                        resolve(data);
                    });
                }).catch(function(jqXHR) {
                    const errorData = JSON.parse(jqXHR.responseText);

                    reject(errorData);
                });
            });
        },

        _mapErrorsToForm: function(errorData) {
            this._removeFormErrors();
            const $form = this.$wrapper.find(this._selectors.newRepForm);

            $form.find(':input').each((index, element) => {
                const fieldName = $(element).attr('name');
                const $wrapper = $(element).closest('.form-group');
                if (!errorData[fieldName]) {
                    // no error!
                    return;
                }

                const $error = $('<span class="js-field-error help-block"></span>');
                $error.html(errorData[fieldName]);
                $wrapper.append($error);
                $wrapper.addClass('has-error');
            });
        },

        _removeFormErrors: function() {
            const $form = this.$wrapper.find(this._selectors.newRepForm);
            $form.find('.js-field-error').remove();
            $form.find('.form-group').removeClass('has-error');
        },

        _clearForm: function() {
            this._removeFormErrors();

            const $form = this.$wrapper.find(this._selectors.newRepForm);
            $form[0].reset();
        },

        _addRow: function(repLog) {
            const tplText = $('#js-rep-log-row-template').html();
            const tpl = _.template(tplText);

            const html = tpl(repLog);
            this.$wrapper.find('tbody').append($.parseHTML(html));

            this.updateTotalWeightLifted();
        }
    });

    /**
     * A "private" object
     */
    const Helper = function ($wrapper) {
        this.$wrapper = $wrapper;
    };
    $.extend(Helper.prototype, {
        calculateTotalWeight: function() {
            let totalWeight = 0;
            this.$wrapper.find('tbody tr').each((index, element) => {
                totalWeight += $(this).data('weight');
            });

            return totalWeight;
        }
    });
})(window, jQuery, Routing, swal);
