(function(){
	var app = {

		init: function(){
			this.setUpListeners(); // events listeners
			this.eventsGallery(); // events adaptive slider
			this.menuMobile();
			this.masonryShops();
		},

		setUpListeners: function () {
			var 
				win = $(window),
				toggleBtn = $('.toggle-btn, .main-logo a'),
				menuItems = toggleBtn.prev().find('a');

			win.on('scroll', this.menuFixed);
			win.on('resize', this.menuMobile);
			toggleBtn.on('click', this.toggleMenu);
			menuItems.on('click', this.toggleMenu);
		},

		eventsGallery: function () {
			$('.events-item_wrap').slick({
				appendArrows: $('.events-gallery_nav'),
				prevArrow: '<button class="events-prev fa fa-angle-left"></button>',
				nextArrow: '<button class="events-next fa fa-angle-right"></button>',
				slidesToShow: 3,
				slidesToScroll: 1,
				rtl: true,
				responsive: [
				   {
					 breakpoint: 1024,
					 settings: {
					   slidesToShow: 3,
					   slidesToScroll: 1
					 }
				   },
				   {
					 breakpoint: 768,
					 settings: {
					   slidesToShow: 2,
					   slidesToScroll: 1
					 }
				   },
				   {
					 breakpoint: 480,
					 settings: {
					   slidesToShow: 1,
					   slidesToScroll: 1
					 }
				   }
				]
			});
		},

		menuFixed: function () {
			var
				wScroll = $(window).scrollTop(),
				menuWrap = $('.main-menu_wrap'),
				topLine = $('.topline_wrap').height();

			if (wScroll > topLine) {
				menuWrap.addClass('fixed');
			} else {
				menuWrap.removeClass('fixed');
			}
		},

		menuMobile: function () {
			var
				dispW = $(window).width(),
				mainMenu = $('.main-menu'),
				sandwich = mainMenu.next().find('.sandwich');

			if (dispW < 992 && !mainMenu.hasClass('toggle')) {
				mainMenu.addClass('toggle hidden visuallyhidden');
			} else if (dispW > 992) {
				mainMenu.removeClass('toggle hidden visuallyhidden');
				sandwich.removeClass('active');
				}
		},

		toggleMenu: function () {
			var
				button = $('.toggle-btn'),
				mainMenu = button.prev();
				sandwich = button.find('.sandwich');

			if(mainMenu.hasClass('toggle')) {
				
				sandwich.toggleClass('active');

				if (mainMenu.hasClass('hidden')) {
					mainMenu.removeClass('hidden');
					setTimeout(function () {
						mainMenu.removeClass('visuallyhidden');
					}, 20);
				} else {
					mainMenu.addClass('visuallyhidden');
					mainMenu.one('transitionend', function(e) {
						mainMenu.addClass('hidden');
					});
				};
			}
		},

		masonryShops: function () {
			$('.shops-wrap').masonry({
				itemSelector: '.shops-item',
				columnWidth: '.grid-sizer',
				percentPosition: true,
				gutter: '.gutter-sizer'
			});
		}

	}

	return app.init();

})();