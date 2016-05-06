(function ($) {
    $(function () {

        $('.button-collapse').sideNav();

        $('.datepicker').pickadate({
            selectMonths: true,
            selectYears: 116,
            monthsFull: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec'],
            weekdaysFull: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
            showMonthsShort: undefined,
            showWeekdaysFull: undefined,
            today: false,
            clear: false,
            close: 'Cerrar',
            // Accessibility labels
            labelMonthNext: 'Siguiente',
            labelMonthPrev: 'Anterior',
            labelMonthSelect: 'Selecciona un mes',
            labelYearSelect: 'Selecciona un año',
            format: 'd mmmm, yyyy',
            formatSubmit: 'dd/mm/yyyy',
            firsDay: 1,
            onSet: function(thingSet) {
                if(thingSet.select)
                    this.close();
            },
            max: new Date(),
            min: new Date(1900, 0, 1)
        });

        $('.modal-trigger').leanModal();

    }); // end of document ready
})(jQuery); // end of jQuery name space