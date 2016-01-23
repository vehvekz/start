(function(){

	var itemLink = $('.main-menu a, .main-logo a'),
		menuOffset = 120;

	var navigation = {

		init: function(){
			this.setUpListeners();
			// this.showSection(window.location.hash, false);
		},
		setUpListeners: function(){
			itemLink.on('click', this.menuShow);
			$(window).on('scroll', this.checkSection);
		},
		menuShow: function(e){
			e.preventDefault();
			navigation.showSection($(this).attr('href'), true);
		},
		showSection: function(section, isAnimate){

			var
				direction = section.replace(/#/, ''),
				reqSection = $('section, header').filter('[data-section="' + direction + '"]'),
				reqSectionPos = reqSection.offset().top;

			if (isAnimate) {
				$('body, html').animate({scrollTop: reqSectionPos}, 500);
			} else {
				$('body, html').scrollTop(reqSectionPos);
			}
		},
		checkSection: function(){
			$('header, section').each(function(){
				var
					$this = $(this),
					topEdge = $this.offset().top - menuOffset,
					bottomEdge = topEdge + $this.height(),
					wScroll = $(window).scrollTop();

				if (topEdge < wScroll && bottomEdge > wScroll) {
					var 
						currentId = $this.data('section'),
						reqLink = itemLink.filter('[href="#' + currentId + '"]');

					if (currentId === "home") {
						itemLink.closest('li').removeClass('active');
					}

					reqLink.closest('li').addClass('active')
						.siblings().removeClass('active');

					window.location.hash = currentId;
				}
				
			});
		}

	};

	return navigation.init();

})();