getData()
    .then(function (data) {
        render('index', data);
    })
    .fail(function (error) {
        console.log(error);
    });