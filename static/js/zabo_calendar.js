$("#calendar tbody tr").click(function () {
    $(this).animate({
        height: ($(this).height() == 115 ? 315 : 115)
    }, 200);
});