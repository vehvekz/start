(function() {

	var app = {
		// Инициализация - точка входа в приложение
		init: function(){
			app.build();
		},

		// объект, который содержит всю информацию о товарах и о текущем заказе
		order: {
			goods : []
		},

		// сумма заказа
		totalPrice: 0,

		// добавление шаблонов товаров в html
		build: function () {
			$.ajax({
				url: 'data.json'
			}).done(function(data){

				app.products = data; // кэшируем продукты
				app.fillOrderObject(app.products); // заполним объект ORDER товарами

				var html = app.fillTemplate('#blocks', data); // заполняем шаблон данными
				$('#products').append(html); // вставляем данные в DOM

				app.plugins(); // подключаем модули, 
				app.setUpListeners(); // подключаем прослушку событий 

			}).fail(function(){
				console.log('ajax fail!');
			});
		},

		// заполняем шаблон данными
		fillTemplate: function (sourceId, data){
			var source = $(sourceId).html(),
				template = Handlebars.compile(source);
			return(template(data));
		},
		
		// заполняет объект ORDER товарами, также добавляет необходимые в будущем свойства 'amount' и 'productSum'
		fillOrderObject: function (data){

			$.each(data.blocks, function(index, val) {
				 app.order.goods.push({
					'productNameRus'  : val.name,
					'productAlias'    : val.alias,
					'productPrice'    : val.price,
					'amount'          : 0,
					'productSum'      : 0
				});
			});

		},

		// инициализирует хэлперы шаблонизатора Handlebars
		registerHelper: function () {
			// Запрещает отрисовывать в корзине заказы с нулевым amount
			Handlebars.registerHelper('if', function(conditional, options) {
				if(conditional) {
					return options.fn(this);
				}
			});
		},

		// Дополнительные модули
		plugins: function () {
			app.spinners = $( ".spinners" ).spinner({
				max: 8, 
				min: 0,
				icons: { 
					down: "fa fa-chevron-down item_down", 
					up: "fa fa-chevron-up item_up" 
				}
			}); // подключаем spinner jquery ui
			$('.ui-icon').empty(); // удаляем внутреннее содержимое иконок со стрелками
		},

		// подключает прослушку событий 
		setUpListeners: function () {
			$(".spinners").on('spin', app.changeOrderSpin ); // Изменение кол-ва товара (spinner)
			// $(".box img, .box .label").on('click', app.changeOrderImg); // Изменение кол-ва товара (img, label)
			$('.cart-box').on('click', '.doit', app.showModal); // по клике на корзину "заказать" - всплывает модальное окно
			$("#order-form").on('submit', app.formSubmit); // отправка формы (заказ)
			// $(window).on('scroll', app.scroll); // скролл окна (показываем/прячем блочок с корзиной)
			$('#order').on('spin', '.spinners', app.spinInCart); // пересчитываем значения в корзине
		},

		// показывает корзину
		showModal: function () {
			if(app.orderStatus === 'filled'){ // если корзина не пуста
				app.renderOrder();
				$('.alert').hide();
				var modalWindow = $('#myModal');
				modalWindow.modal('show');
				// в случае, если форма открывается во второй раз, после отправки заказа
				// modalWindow.find('form').show();
				// modalWindow.find('button[type="submit"]').show();
				// modalWindow.find('.done-box').remove();
			}else{ // если корзина пуста
				$('.alert').show(); // показываем сообщение
			}
		},

		//  Добавление в корзину (то же, что и app.changeOrderImg), срабатывает при смене значение спиннеров
		changeOrderSpin: function (event, ui) {
			$('.alert').hide(); // прячем сообщение об ошибке (корзина пуста)

			var thisInput = event.currentTarget,
				newVal = ui.value,
				input = $(thisInput),
				productAlias = input.attr('data');
			// Отправляем в метод app.preOrder количсетво товара из инпута и его наименование (alias)
			app.preOrder(newVal, productAlias);
		},

		// наполняем объект заказа app.order
		// метод принемает значение инпута (количество товара) и название товара
		preOrder: function (value, productAlias) {
			// Снова проходимся по каждому объекту массива goods, изменяем количество товара и вычисляем итоговую стоимость каждого товара
			$.each(app.order.goods, function(index, val) {
				if( val.productAlias === productAlias){
					val.amount = value; // Записываем в свойство amount количество товара из инпута
					val.productSum = value * val.productPrice; // умножаем количество товара на стоимость за еденицу. Записываем в productSum результат общей стоимости каждого товара.
				}
			});
				// Кешируем общую сумму заказа (sum) и количество наименований товара (amount)
			var sum = app.totalPriceFun(),
				amount = app.numberOfProductsFun();
			
			app.renderCartBox(sum, amount); // выводим сумму заказа и кол-во товаров в блок корзины

		},

		// считает общую стоимтось заказа
		totalPriceFun: function () {
			var totalPrice = 0;
			$.each(app.order.goods, function(index, val) {
				 totalPrice = totalPrice + val.productSum; // общая сумма заказа
			});
			app.totalPrice = totalPrice; // кэширует общую стоимость заказа
			return(totalPrice);
		},

		// считает общее кол-во продуктов
		numberOfProductsFun: function () {
			var numberOfProducts = 0;
			$.each(app.order.goods, function(index, val) {
				 numberOfProducts = numberOfProducts + val.amount;  // сколько всего товаров в корзине
			});
			return(numberOfProducts);
		},

		// выводит сумму заказа в блок корзины 
		renderCartBox: function(sum, amount) {
			var res; // Переменная res будет выводить строку с информацией о заказе в корзину
			if (amount !== 0){
				res = '<b>' + amount + '</b> товаров на <b>' + sum + '</b> рублей';
				app.orderStatus = 'filled';
			}else{
				res = 'Ваша корзина пуста';
				app.orderStatus = 'empty';
			}

			$('#status').html(res);
		},

		// Рендерит заказ (продукты) в корзиные
		renderOrder: function () {
			var data = app.order; // подготавливаем объект для данных Handlebars
			data.totalPrice = app.totalPrice; // добавляем в него общую стоимость заказа
		
			var html = app.fillTemplate('#order-template', data); // заполняем шаблон данными
			$('#order').html(html);// вставляем данные в DOM

			app.plugins(); // подключаем jquery ui для отрендеренных инпутов
		},

		// изменение заказа в корзине
		spinInCart: function (event, ui) {
			var thisInput = event.currentTarget, // Инпут с количеством товара
				newVal = ui.value, // Значение в инпуте у товара
				input = $(thisInput),
				productAlias = input.attr('data'), // Берем у искомого инпута значение alias
				productLine = input.parents('.cart-prod-line'), // Берем элемент контейнер для данных о заказе
				productPrice = input.attr('data-price'); // Берем стоимость продукта

			productLine.find('.current-sum').text(productPrice * newVal); // пересчитываем стоимость текущего товара в модальном окне
			app.preOrder(newVal, productAlias); // обновляем объект заказа
			$('#total-sum').val(app.totalPrice); // пересчитываем общую стоимость заказа в модальном окне
			app.productAreaSpinnersUpdate(newVal, productAlias); // обновляем спиннеры главной области
		},

		// обновляем спиннеры главной области
		productAreaSpinnersUpdate: function(newVal, productAlias){
			var spinInput = $('#products').find('input[data="' + productAlias + '"]');
			spinInput.spinner("value", newVal);
		},

		// отправляет запрос на сервер
		formSubmit: function (ev) {
			ev.preventDefault();

			var form = $(this),
				name = $('#name').val(),
				email = $('#email').val(),
				goods = [],
				total = app.totalPrice,
				modalDialog = $('.modal-dialog'),
				submitBtn = modalDialog.find('button[type="submit"]'),
				msgBox = $('.msg');
			
			msgBox.html(''); // очищаем блок сообщений с сервера

			$.each(app.order.goods, function(index, val) {  
				if(val.amount !== 0){
					goods.push({
						'productNameRus'  : val.productNameRus, 
						'productPrice'    : val.productPrice,
						'amount'          : val.amount,
						'productSum'      : val.productSum   
					});
				}
			});

			var data = {
				'goods' : goods,
				'total' : total,
				'name'  : name,
				'email' : email
				};

			submitBtn.attr({disabled: 'disabled'}).addClass('spin-btn'); // защита от повторного нажатия + показываем загрузчик

			$.ajax({
				type: "POST",
				url: "contact_form/contact_process.php",
				data: data
			}).done(function(msg){
				if(msg == 'OK') {
					var result = '<div class="done-box">Спасибо за ваш заказ!<br> Мы свяжемся с вами в течение дня.</div>';                    
					modalDialog.find('.modal-body').append(result); // вставляем сообщение
					submitBtn.hide(); // удаляем кнопку ЗАКАЗАТЬ
					form.hide(); // прячем форму
					// очищаем заказ, корзину, объекты и свойства
					app.spinners.spinner( "value", 0 );
					$('#status').html('Ваша корзина пуста');
					app.order.goods = [];
					app.fillOrderObject(app.products);
					app.totalPrice = 0;
				} else {
					$(".msg").html(msg);
				}
			}).fail(function(){
				console.log('ajax fail!');
			}).always(function(){
				submitBtn.removeAttr('disabled').removeClass('spin-btn');
			});

			return false;
		}

	}

	app.init();

})();