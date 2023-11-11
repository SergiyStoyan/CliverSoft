

  (function() {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
  })();


EOL.namespace('profile');

EOL.profile.timers = {};

//we really have to stop doing this, library files which only contain function/object definitions should be lazy loaded
window.addEvent('domready', function() {
    var dialogHash = window.location.hash;
        switch (dialogHash) {
            case "#pledgeDialog":
                    EOL.pledge.verifyPledge();
                break;
                case "#profleImageDialog":
                    EOL.profileImage.open('provider');
                break;
                case "#idVerification":
                    EOL.idVerifRequestModal.open();
                break;
        }

    //setup smarterer test links in test list modals
    $(document.body).addEvent('click:relay(a.smartererTestLink)',function(event, target){
        var urlSlug = target.getProperty('data-urlSlug');
        var elanceCallToAction = target.getProperty('data-elanceCallToAction');
        var testsListDialog = EOL.profile.getTestsListDialog();
        testsListDialog.hide();

        EOL.smartererTestWidget.showModalByCallToAction(urlSlug, elanceCallToAction);
    });

    $$('.test_menu').addEvents({
        mouseenter: function(){
            $$('.eol-tooltip').addClass('displayNone');
            var skillId = $(this).getParent('tr').get('data-id');
            if (EOL.profile.timers[skillId]) clearTimeout(EOL.profile.timers[skillId]);
            var tooltip = $(this).getParent().getElement('.eol-tooltip');
            tooltip.removeClass('displayNone');
        },
        mouseleave: function(){
            var skillId = $(this).getParent('tr').get('data-id');
            var tooltip = $(this).getParent().getElement('.eol-tooltip');
            EOL.profile.timers[skillId] = setTimeout(function(){
                tooltip.addClass('displayNone');
            }, 400);
        }
    });
    $$('.percentile_icon_btn').addEvents({
        click: function() {
            var tooltip = $(this).getParent().getElement('.eol-tooltip');
            if (tooltip.hasClass('displayNone')) {
                $$('.eol-tooltip').addClass('displayNone');
                tooltip.removeClass('displayNone');
            }
            else {
                tooltip.addClass('displayNone');
            }
        }
    });
});

EOL.profile.toggleSnapshot = function(type) {
    if(type == '12mo') {
        var i = 1;
        while($('snapshot-12mo-'+i)) {
            $('snapshot-12mo-'+i).style.display = '';
            $('snapshot-life-'+i).style.display = 'none';
            if($('snapshot-label-12mo-'+i)) {
                $('snapshot-label-12mo-'+i).style.display = '';
                $('snapshot-label-life-'+i).style.display = 'none';
            }
            i++;
        }
        $('snapshot-12mo').addClass('selected');
        $('snapshot-life').removeClass('selected');
    }
    else if(type == 'life') {
        var i = 1;
        while($('snapshot-12mo-'+i)) {
            $('snapshot-life-'+i).style.display = '';
            $('snapshot-12mo-'+i).style.display = 'none';
            if($('snapshot-label-life-'+i)) {
                $('snapshot-label-life-'+i).style.display = '';
                $('snapshot-label-12mo-'+i).style.display = 'none';
            }
            i++;
        }
        $('snapshot-life').addClass('selected');
        $('snapshot-12mo').removeClass('selected');
    }
}

EOL.profile.switchCategory = function(catid,baseUrl) {
    window.location = baseUrl + ((catid) ? (catid + '/') : '');
}

EOL.profile.clickAwayMenu = function(event) {
    var el = null;
    if(window.event)
        el = window.event.srcElement;
    else
        el = (event.target.tagName) ? event.target : event.target.parentNode;
        
    do {
        if(el.id == 'catlist-selector' || el.id == 'catlist')
            return;
    } while (el = el.parentNode);
    
    EOL.profile.toggleCatlist();
}

EOL.profile.toggleCatlist = function() {
    if($('catlist-c').style.display == 'none') {
        $('catlist-c').style.display = '';
        if( document.addEventListener ) { //mozilla
            document.addEventListener('mousedown', EOL.profile.clickAwayMenu, false);
        } else if( document.attachEvent ) {  //ie
            document.attachEvent('onmousedown', EOL.profile.clickAwayMenu);
        }
    }
    else {
        $('catlist-c').style.display = 'none';
        if( document.removeEventListener ) { //mozilla
            document.removeEventListener('mousedown', EOL.profile.clickAwayMenu, false);
        } else if( document.detachEvent) {  //ie
            document.detachEvent('onmousedown', EOL.profile.clickAwayMenu);
        }
    }
}

EOL.profile.userVideoDoialog = null;
EOL.profile.openUserVideo = function() {
    if (!$('userVideo')) return false;

    if (!EOL.profile.userVideoDoialog) {
        EOL.profile.userVideoDoialog = new EOL.dialog(
            $('userVideo').get('html'),
            {
                position:'fixed',
                modal:true
            }
        );
        //$('getStartedVideo').set('html', '');
    }
    EOL.profile.userVideoDoialog.show();
}

EOL.profile.toggleRollbar = function() {
    var isEditPage = document.URL.indexOf("/edit/") >= 0;
    var hasWelcomeBanner = $('welcome-wrapper');
    var isFocusedOnSample = document.URL.indexOf("#posSlide") >= 0;
    var isPortfolioPage = $('cta-banner').hasClass('portfolio');
    var isHomepage = $('cta-banner').hasClass('homepage');
    var userIsAvailable = $$('.p-away').length <= 0;
    var offset = 0;
    offset = hasWelcomeBanner ? 345 : 230;

    if (isPortfolioPage){
        offset = hasWelcomeBanner || isFocusedOnSample ? 300 : 185;
    }

    offset = isHomepage ? 510 : offset;

    if (userIsAvailable && !isEditPage){
        EOL.belowFold.init(offset, true,
            function(){
                try{
                    $('cta-banner').set('tween', {
                        duration:'short'
                    });
                    $('cta-banner').tween('top', ['-80','0']);
                } catch(err){}
            },
            function(){
                try{
                    $('cta-banner').set('tween', {
                        duration:'short'
                    });

                    $('cta-banner').tween('top', ['0','-80']);
                } catch(err){}
            });
    }
}

EOL.namespace('portfolio.list');

EOL.portfolio.list.wait = null;
EOL.portfolio.list.current = 1;

EOL.portfolio.list.getItemCount = function() {
    var i = 1;
    while($('portfolio-item-'+i)) {
        i++;
    }
    return i - 1;
}

EOL.portfolio.list.mouseDown = function(event, elem){
    $(elem).addClass('down');
    return true;
};

EOL.portfolio.list.mouseUp = function(event, elem){
    $(elem).removeClass('down');
    $(elem).onclick();
};

EOL.portfolio.list.next = function() {
    if(EOL.portfolio.list.wait)
        return;
    EOL.portfolio.list.wait = true;
    
    var count = EOL.portfolio.list.getItemCount();
    
    var expandEffect = new Fx.Tween('portfolio-list', { duration:1000, transition:Fx.Transitions.Expo.easeOut, onComplete: EOL.portfolio.list.finish});
    //get current left
    var curPos = parseInt($('portfolio-list').offsetLeft);
    var nextPos = curPos - 360;
    var maxWidth = (count-1) * 360 * -1;
    if(nextPos < maxWidth) {
        EOL.portfolio.list.wait = null;
        return;
    }
    
    if(EOL.portfolio.list.current + 1 >= count) {
        $('portfolio-right').addClass('transparent');
    }
    
    //update count
    EOL.portfolio.list.current++;
    if(!$('img-'+EOL.portfolio.list.current).src) {
        $('img-'+EOL.portfolio.list.current).src = portfolioImg[EOL.portfolio.list.current][0];
        $('img-'+EOL.portfolio.list.current).className = portfolioImg[EOL.portfolio.list.current][1];
    }
    $('portfolio-left').removeClass('transparent');
    expandEffect.start('left', nextPos.toString()+'px');
};

EOL.portfolio.list.previous = function() {
    if(EOL.portfolio.list.wait)
        return;
    EOL.portfolio.list.wait = true;
    
    var expandEffect = new Fx.Tween('portfolio-list', { duration:1000, transition:Fx.Transitions.Expo.easeOut, onComplete: EOL.portfolio.list.finish });
    //get current left
    var curPos = parseInt($('portfolio-list').offsetLeft);
    var nextPos = curPos + 360;
    if(nextPos > 0) {
        EOL.portfolio.list.wait = null;
        return;
    }
    
    if(EOL.portfolio.list.current - 1 <= 1) {
        $('portfolio-left').addClass('transparent');
    }
    
    //update count
    EOL.portfolio.list.current--;
    if(!$('img-'+EOL.portfolio.list.current).src) {
        $('img-'+EOL.portfolio.list.current).src = portfolioImg[EOL.portfolio.list.current];
    }
    $('portfolio-right').removeClass('transparent');
    expandEffect.start('left', nextPos.toString()+'px');
};

EOL.portfolio.list.finish = function(){
    EOL.portfolio.list.wait = null;
};

EOL.namespace('dashboard.widget');

EOL.dashboard.widget.load = function(id,url,params,callback,useJSONP) {
    if(!params)
        params = '';

    if(typeof(useJSONP)==='undefined') useJSONP = false;

    var handleSubmitSuccess = function(response) {
        if (!useJSONP) {
            response = JSON.decode(response);
        }
        $(id).set('opacity',0);
        $(id).set('html',response.data.html);
        new Fx.Tween(id,{duration:200}).start('opacity',1);
        if(callback)
          callback();
    };

    var options = {
        url: url,
        method: 'get',
        data: params,
        onSuccess: handleSubmitSuccess,
        onFailure: function() { }
    };

    if (useJSONP) {
        curAsyncReq = new Request.JSONP(options);
    } else  {
        curAsyncReq = new Request(options);
    }

    curAsyncReq.send();
};

EOL.profile.showMoreSkills = function() {
    $('showMoreSkills').hide();
    $$('#profileSkills tr').removeClass('displayNone');
};

EOL.profile.showTestsDialog = function(id) {
    var tests = $(id);
    if (!tests) return;
    var dialogContent = $(id).get('html');
    var dialog = EOL.profile.getTestsListDialog();
    dialog.update(dialogContent);
    dialog.show();
};
EOL.profile.getTestsListDialog = function(){
    if (!EOL.profile.testsDialog) {
        EOL.profile.testsDialog = new EOL.dialog('', {position: 'fixed', modal:true, width:570});
    }
    return EOL.profile.testsDialog;
};

/* code using elance dialogs */

EOL.namespace('addtolist');

EOL.addtolist.dialog = null;
EOL.addtolist.curElem = null;
EOL.addtolist.signals = {
    show: new signals.Signal(),
    close: new signals.Signal(),
    save: new signals.Signal()
};

EOL.addtolist.toggleDialog = function(objId, objType, context) {
	var request = new Request({	url: '/php/myelance/main/addToListHTML.php?objid='+escape(objId)+'&objtype='+escape(objType)+'&context='+context+'&t=' + getDateTime(), 
								method: 'get',
								onSuccess: function(req) {
									EOL.addtolist.dialog = new EOL.dialog(req, {position: 'fixed', modal:true, close:true, afterHide: function() {EOL.addtolist.opened = false;}});
									EOL.addtolist.dialog.show();
								},
								onFailure: function() {}
							   }).send();
}
EOL.addtolist.opened = false;
EOL.addtolist.close = function(saved) {
	EOL.addtolist.dialog.hide();
	EOL.addtolist.opened = false;
    if (!saved) {
        EOL.addtolist.signals.close.dispatch();
    }
}

EOL.addtolist.open = function(objId, objType, context, elemId) {
	// Remove # sign from job title, it can be mixed with anchor link 
	objType = objType.replace(/#/g, '');
	
	if (EOL.addtolist.opened) return;
	EOL.addtolist.opened = true;
	EOL.addtolist.curElem = elemId;
	
	//context is S for seller (profile), B for buyer (job)
   var url = '/php/myelance/main/addWatchList.php?mode=check&addToListObjType='+context+'&addToListObjId='+objId+'&addToListObjName='+escape(objType);
   
   var req = new Request(
   {
   	 url: url,
     asynchronous:true,
     method:'get',
     onSuccess: function(t){
		 var celldata = t.split('##');
         if (celldata[0].indexOf('NoAuth') == 0) { 
            var conf = new EOL.dialog(['Not Authorized','You are not authorized to perform this action.'], {position: 'fixed', modal:true, width: 300, close:true}).show();
            return;
         }
		 // check to see if we got no for our question, does the user already exist?
         if(celldata[0].indexOf('No') != -1){
         	EOL.addtolist.toggleDialog(celldata[1], celldata[2], context);
         }else{
			if(context=='S' || context=='B') {
			 if($('header-watchlist')) $('header-watchlist').innerHTML = '&raquo; On Watch List';
			 if($('menu-watchlist')) $('menu-watchlist').innerHTML = 'On Watch List';
			 var conf = new EOL.dialog(['User already added',celldata[2] + ' is already in your Watch List. '], {position: 'fixed', modal:true, width: 300, close:true}).show();
			}
			else if (context=='P') {
				var handleStar = EOL.addtolist.handleStarSuccess( EOL.addtolist.curElem,'project');
				handleStar();
				if ($(EOL.addtolist.curElem).get('text')) {
					$(EOL.addtolist.curElem).set('text', $(EOL.addtolist.curElem).title);
				}
			}
            return;
         }
     },
     onFailure: function(){ alert('There was an error processing your request. Please try again.') }
   }
   );
   req.send();

   EOL.addtolist.signals.show.dispatch();
}


EOL.addtolist.submit = function() {
	if ($('addToListBtn')) disableElems($('addToListBtn'));
	var objType = $('addToListform').elements['addToListObjType'].value;
	var nav = 'provider';
	if (objType == 'B') {nav = 'buyer';}
	else if(objType == 'P') {nav = 'project';}
   var postData = $('addToListform').toQueryString();

    var numOfChars = simpleTextCount($('comments'));
    if (numOfChars > 4000){
        $('addToListcharLimit').setStyle('color', '#EE2C2C');
        enableElems($('addToListBtn'));
        return false;
    }


	var options = {
		url: '/php/myelance/main/addWatchList.php?t=' + getDateTime(), 
		method: 'post',
		data: postData,
		onSuccess: function(response) {
			if ($('addToListBtn')) enableElems($('addToListBtn'));
		    if( response.length > 0 && (response.indexOf('success') == -1)) {
		    	var conf = new EOL.dialog(['We\'re Sorry',response], {position: 'fixed', modal:true, width: 300, close:true}).show();
		    }
		    else {
				EOL.addtolist.close(true);
				if(objType == 'S' || objType == 'B') {
					if($('header-watchlist')) $('header-watchlist').innerHTML = '<a href="/php/myelance/main/watchCenter.php?type='+nav+'" class="watchlist-btn sprite-watchlist-star-small-on">On Watch List</a>';
					if($('menu-watchlist')) $('menu-watchlist').innerHTML = ' <a href="/php/myelance/main/watchCenter.php?type='+nav+'">On Watch List</a>';
					var handleStar = EOL.addtolist.handleStarSuccess( EOL.addtolist.curElem,nav);
					handleStar();
					if ($(EOL.addtolist.curElem).get('text')) {
						$(EOL.addtolist.curElem).set('text', $(EOL.addtolist.curElem).title);
					}
				}
				else if(objType == 'P') {
					if(EOL.addtolist.curElem.indexOf('watchlistBox') == 0) {
						$(EOL.addtolist.curElem)
							.set('href', '/php/myelance/main/watchCenter.php?type='+nav)
							.set('text', 'On Watch List')
							.set('title', 'On Watch List')
							.removeClass('sprite-watchlist-star-small-off')
							.addClass('sprite-watchlist-star-small-on');
					}
					else {
						var handleStar = EOL.addtolist.handleStarSuccess( EOL.addtolist.curElem,nav);
						handleStar();
						if ($(EOL.addtolist.curElem).get('text')) {
							$(EOL.addtolist.curElem).set('text', $(EOL.addtolist.curElem).title);
						}
					}
				}
                EOL.addtolist.signals.save.dispatch();
		    }
		}, 
		onFailure: function() {alert('There was an error processing your request. Please try again.')}
	};
	
	var req = new Request(options);
	req.send();
}


EOL.addtolist.handleStarSuccess = function(elemId,nav) {
	if(!elemId)
		elemId = 'watchlistIcon';

	return function() {
		var el = $(elemId);
		if(!el)
			return;
		
		if(el.hasClass('sprite-watchlist-star-big-off')) {
			removeClassName(el, 'sprite-watchlist-star-big-off');
		    addClassName(el, 'sprite-watchlist-star-big-on');
		}
		else if(el.hasClass('sprite-watchlist-star-small-off')) {
			removeClassName(el, 'sprite-watchlist-star-small-off');
		    addClassName(el, 'sprite-watchlist-star-small-on');
		}
		
		el.setAttribute('onclick', "return false;");
		
		el.title = "On Watch List";
		var myfun = function() {
			window.location = '/php/myelance/main/watchCenter.php?type='+nav;
		}
		smartAddEvent(el,'click',myfun);
	}
}

EOL.addtolist.setTextColor = function(objId, colorCode) {
    $(objId).setStyle('color', colorCode);
}


//during build...
//copied to (not in p4 depot) presentation/symfonyBundles/Elance/PresentationFrameworkBundle/Resources/public/js/featuredUpsell.js
//copied from (in p4 depot) html/scripts/post/featuredUpsell.js 
EOL.namespace('featuredUpsell');
EOL.featuredUpsell.setupRelistAsFeaturedModalTrigger = function (elementId, jobId){
    window.addEvent('domready', function(){
        $(elementId).addEvent('click', function(){
           var modal = new EOL.featuredUpsell.relistAsFeaturedModal({'jobId':jobId});
           modal.open();
        });
    });
};

EOL.featuredUpsell.setupRelistFeaturedJobModalTrigger = function (elementId, jobId){
    window.addEvent('domready', function(){
        $(elementId).addEvent('click', function(){
           var modal = new EOL.featuredUpsell.relistFeaturedJobModal({'jobId':jobId});
           modal.open();
        });
    });
};

EOL.featuredUpsell.setupMaxInvitesModalTrigger = function (elementId, jobId){
    window.addEvent('domready', function(){
        $(elementId).addEvent('click', function(){
           var modal = new EOL.featuredUpsell.maxInvitesReachedModal({'jobId':jobId});
           modal.open();
        });
    });
};

EOL.featuredUpsell.setupPotentialMaxInvitesModalTrigger = function (elementId, jobId){
    window.addEvent('domready', function(){
        $(elementId).addEvent('click', function(){
           var modal = new EOL.featuredUpsell.potentialMaxInvitesReachedModal({'jobId':jobId});
           modal.open();
        });
    });
};
EOL.featuredUpsell.setupConfirmedFeaturedModalTrigger = function (elementId, jobId, paymentId){
    window.addEvent('domready', function(){
        $(elementId).addEvent('click', function(){
           var modal = new EOL.featuredUpsell.confirmedFeaturedModal({'jobId':jobId, 'paymentId':paymentId});
           modal.open();
        });
    });
};
EOL.featuredUpsell.setupBaseModalTrigger = function (elementId, jobId){
    window.addEvent('domready', function(){
        $(elementId).addEvent('click', function(){
           var modal = new EOL.featuredUpsell.genericModal({'jobId':jobId});
           modal.open();
        });
    });
};

EOL.featuredUpsell.setupConfirmedFeaturedOnLoadTrigger = function(jobId, paymentId){
    window.addEvent('domready', function(){
        EOL.featuredUpsell.showConfirmedFeaturedModal(jobId, paymentId);
    });
}
EOL.featuredUpsell.setupAlreadyFeaturedOnLoadTrigger = function(jobId, paymentId){
    window.addEvent('domready', function(){
        EOL.featuredUpsell.showAlreadyFeaturedModal(jobId, paymentId);
    });
}
EOL.featuredUpsell.setupGenericFeaturedOnLoadTrigger = function(jobId, paymentId){
    window.addEvent('domready', function(){
        EOL.featuredUpsell.showGenericFeaturedModal(jobId, paymentId);
    });
}
//helpers to show default modals
EOL.featuredUpsell.showMaxInvitesReachedModal = function(jobId) {
    var modal = new EOL.featuredUpsell.maxInvitesReachedModal({'jobId':jobId});
    modal.open();
}
EOL.featuredUpsell.showPotentialMaxInvitesReachedModal = function(jobId) {
    var modal = new EOL.featuredUpsell.potentialMaxInvitesReachedModal({'jobId':jobId});
    modal.open();
}
EOL.featuredUpsell.showRelistAsFeaturedModal = function(jobId) {
    var modal = new EOL.featuredUpsell.relistAsFeaturedModal({'jobId':jobId});
    modal.open();
}
EOL.featuredUpsell.showConfirmedFeaturedModal = function(jobId, paymentId) {
    var modal = new EOL.featuredUpsell.confirmedFeaturedModal({'jobId':jobId, 'paymentId':paymentId});
    modal.open();
}
EOL.featuredUpsell.showGenericFeaturedModal = function(jobId) {
    var modal = new EOL.featuredUpsell.genericModal({'jobId':jobId});
    modal.open();
}
EOL.featuredUpsell.showAlreadyFeaturedModal = function(jobId) {
    var modal = new EOL.featuredUpsell.alreadyFeaturedModal({'jobId':jobId});
    modal.open();
}

//defining the modal class
EOL.featuredUpsell.modal = new Class({
    modalRequest:null,
    //used by extending classes to add GET params to the modal ajax request
    modalRequestParameters:{},
    dialog:null,
    jobId:null,
    modalUrl:null,
    modalUrlAction:null,
    height:null,
    width:null,
    communicationErrorMessage:'Unable to communicate with Elance, please refresh and try again.',
    onCommunicationError: function(response) {
        alert(this.communicationErrorMessage);
    },
    onConfirm:function(event){
        window.location.href =  $(this.dialog.containerEl).getElement('a.confirm').getAttribute('href');
    },
    onCancel:function(event){
        this.hide();
    },
    className:'',
    redirect:null,
    optionDefaults:{
        jobId:null,
        modalUrl: '/php/post/main/featuredUpsellAHR.php',
        modalUrlAction:null,
        height:null,
        width:null,
        className:'',
        redirect:window.location.href
    },
    options:{},//used by extending classes to override options
    initialize: function(options){
        this.options = Object.merge({}, this.optionDefaults, this.options, options);
        var self = this;
        if (!this.options.jobId){
            throw "You must supply a jobId option";
        }
        if (!this.options.modalUrl){
            throw "You must supply the url where the modal can be fetched";    
        }
        if (!this.options.modalUrlAction){
            throw "You must supply the controller action (i.e. MaxInvitesModal)";
        }
        this.setObjectAttributesFromOptions();
        this.dialog = new EOL.dialog('', { position: 'scroll', className:'featuredUpsellDialog '+this.className, width:this.width,height:this.height});
        //used for any additional parameters to be sent in modal request by extending classes
        var requestOptions = {
            'url':this.modalUrl,
            'data':Object.merge({},{'jobId':this.jobId, 'action':this.modalUrlAction, 'redirect':this.redirect},this.modalRequestParameters),
            'method':'get',
            'onSuccess':function(response){
                self.update(response.data.modalContent);
            },
            'onFailure':function(response){
                self.onCommunicationError(response);    
            }
        };
        this.modalRequest = new Request.JSON(requestOptions);

    },
    setObjectAttributesFromOptions: function(){
        var self = this;
        Object.each(this.options, function(item, key){
            self[key] = item;
        });
    },
    trackEvent: function(eventName){
        if (_gaq && _gaq.push) {
            _gaq.push(['_trackEvent', 'feature_upsell', eventName, this.options.modalUrlAction]);
        }
    },
    //This should be used to open the model as a response to the user interacting directly with a UI element.
    open: function(){
        this.trackEvent('open');
        this.show();
    },
    //This should be used to open the model as a secondary result of a user interaction (i.e. another interaction caused a state in which this modal should be displayed)
    show: function(){
        this.showLoading();
        this.modalRequest.send();
    },

    //this is used to close the modal as a secondary result of a tracked user interaction, but it should not be tracked
    hide: function(){
        this.dialog.hide();
    },

    //this maps to ui elements that the user interacts with, which have the intent of closing the modal, these should be tracked
    close: function(){
        this.trackEvent('close');
        this.hide();
    },

    //reset the dialog close button to response to our handlers and not the default dialog handler
    resetCloseButton: function(){
        var self = this;
        if ($(this.dialog.containerEl)){
            oldCloseButton = $(this.dialog.containerEl).getElement('.eol-dialog-close');
            //this removes event handlers
            var newCloseButton = oldCloseButton.clone();
            //setup new handler
            newCloseButton.addEvent('click', function(){
                self.close();
            });
            //append new close button
            newCloseButton.inject(oldCloseButton, 'after');
            oldCloseButton.dispose();
        }
    },

    showLoading: function(){
        var loadingWidth  = this.width?this.width:'auto';
        var loadingHeight = this.height?this.height:'auto';
        var loading = '<div class="popup-loading" style="width:'+loadingWidth+'px; height:'+loadingHeight+'px;"></div>';
        this.dialog.update(loading);
        this.dialog.show();
        //lazy reset of close button 
        this.resetCloseButton();

    },

    update: function(htmlContent){
        this.dialog.update(htmlContent);
        var self = this;

        confirmButton = $(this.dialog.containerEl).getElement('a.confirm');
        confirmButton && confirmButton.addEvent('click', function(event){
            event.stop();
            self.trackEvent('confirm');
            self.onConfirm(event);
        });

        var closeButton = $(this.dialog.containerEl).getElement('a.cancel');
        closeButton && closeButton.addEvent('click', function(event){
            event.stop();
            self.trackEvent('cancel');
            self.onCancel(event);
        });
    },


});

EOL.featuredUpsell.maxInvitesReachedModal = new Class({
    Extends:EOL.featuredUpsell.modal,
    options: {
        modalUrlAction: 'MaxInvitesModal',
        width:548,
        className:'maxInvitesReachedModal',
    },
    //While overwritting onConfirm is unecessary here, I have provided it to demonstrate how to call the parents onConfirm method
    onConfirm:function(event){
        this.parent(event);
    }

});

EOL.featuredUpsell.potentialMaxInvitesReachedModal = new Class({
    Extends:EOL.featuredUpsell.modal,
    options: {
        modalUrlAction: 'PotentialMaxInvitesModal',
        width:548,
        className:'potentialMaxInvitesReachedModal'
    }
});



EOL.featuredUpsell.genericModal = new Class({
    Extends:EOL.featuredUpsell.modal,
    options: {
        modalUrlAction: 'GenericModal',
        width:693,
        height:430,
        className:'genericModal',
    }
});

EOL.featuredUpsell.confirmedFeaturedModal = new Class({
    Extends:EOL.featuredUpsell.modal,
    initialize:function(options){
        this.modalRequestParameters={'paymentId':options.paymentId};
        this.parent(options);
    },
    options:{
        modalUrlAction: 'ConfirmedFeaturedModal',
        width:527,
        height:285,
        className:'confirmedFeaturedModal',
    },
    onConfirm:function(){
        //intentionally avoiding parent behavior... just want to close modal
        this.hide();
    }
});

EOL.featuredUpsell.alreadyFeaturedModal = new Class({
    Extends:EOL.featuredUpsell.modal,
    options: {
        modalUrlAction: 'AlreadyFeaturedModal',
        width:548,
        height:120,
        className:'AlreadyFeaturedModal'
    },
    onConfirm:function(){
        //intentionally avoiding parent behavior... just want to close modal
        this.hide();
    }
});


EOL.featuredUpsell.relistAsFeaturedModal = new Class({
    Extends:EOL.featuredUpsell.modal,
    options: {
        modalUrlAction: 'RelistAsFeaturedModal',
        width:548,
        height:460,
        className:'RelistAsFeaturedModal'
    }
});

EOL.featuredUpsell.relistModal = new Class({
    Extends:EOL.featuredUpsell.modal,
    relistFailureMessage:'Unfortunatly you job could not be relisted.  Please contact support.',
    onConfirm:function(event){
        var url =  $(this.dialog.containerEl).getElement('a.confirm').getAttribute('href');
        var self = this;
        var relistRequest = new Request.JSON({
            'url':url,
            'data':{jobId:self.jobId},
            'method':'post',
            'onSuccess':function(response){
                if (response.data.relisted){
                    self.trackEvent('relistSuccess');
                    self.onRelistSuccess(response);
                } else {
                    self.trackEvent('relistFailure');
                    self.onRelistFailure(response);
                }

            },
            'onFailure':function(response){
                self.onCommunicationError(response);
            }
        });
        relistRequest.send();
    },
    onRelistSuccess:function(response){
        if (this.options.onRelistSuccess){
            this.options.onRelistSuccess.call(this, response);
        }
        return;
    },
    onRelistFailure:function(response){
        if (this.options.onRelistFailure) {
            this.options.onRelistFailure.call(this, response);
        } else {
            //TODO: something better than an alert
            alert(this.relistFailureMessage);
        }
    }
});

EOL.featuredUpsell.relistFeaturedJobModal = new Class({
    Extends:EOL.featuredUpsell.relistModal,
    options:{
        modalUrlAction: 'RelistFeaturedJobModal',
        width:577,
        height:187,
        className:'relistFeaturedJobModal'
    }
});



/* contact me panel using smarty templates with mootools */
EOL.namespace('contactme');

EOL.contactme.dialog = null;
EOL.contactme.signals = {
    show: new signals.Signal(),
    invite: new signals.Signal(),
    newJob: new signals.Signal(),
    close: new signals.Signal()
};

EOL.contactme.showFeaturedUpsellMaxInvitesReachedModal = function(jobId){
    EOL.featuredUpsell.showMaxInvitesReachedModal(jobId);
}


EOL.contactme.showFeaturedUpsellGenericModal = function(jobId){
    EOL.featuredUpsell.showGenericFeaturedModal(jobId);
}


EOL.contactme.showFeaturedUpsellConfirmationModal = function(jobId, paymentId){
    EOL.featuredUpsell.showConfirmedFeaturedModal(jobId, paymentId);
}



EOL.contactme.open = function(userid, catid, bidid, source) {
	//if(!tab) tab = null;
	//if(!mode) mode = null;
	if (!bidid) bidid = '';
	if (!source) source = '';
	
	//multiple userids can only be used in invite mode
	if(typeof userid == "array") {
		var userids = userid[0];
		for(var i=1; i<userid.length; i++) {
			userids += ',' + userid[i];
		}
		userid = userids;
	}
	
	var request = new Request({ url: '/php/profile/main/contactMeHTML.php?userid='+userid +'&catid='+ catid +'&bidid='+ bidid + '&source=' + source + '&t=' + getDateTime(), 
								method: 'get',
								onSuccess: function(req) {
									addCSS('/styles/profile/contactMe.css');
									EOL.contactme.dialog = new EOL.dialog(req, {id:'contactmedialog', position: 'scroll', width: 570, modal:true, close:true});
									EOL.contactme.dialog.show();
									//EOL.contactme.tab(tab);
								},
								onFailure: function() {}
					   }).send();

    EOL.contactme.signals.show.dispatch();
}

EOL.contactme.close = function() {
	EOL.contactme.dialog.hide();
    EOL.contactme.signals.close.dispatch();
}

EOL.contactme.tab = function(tab) {
	
	if(tab == 'invite') {
		if($('cm_invite')) $('cm_invite').style.display = '';
		if($('cm_call')) $('cm_call').style.display = 'none';
		if($('cmt-invite')) $('cmt-invite').className = 'selected';
		if($('cmt-call')) $('cmt-call').className = '';
	}
	else if(tab == 'call') {
		if($('cm_invite')) $('cm_invite').style.display = 'none';
		if($('cm_call')) $('cm_call').style.display = '';
		if($('cmt-invite')) $('cmt-invite').className = '';
		if($('cmt-call')) $('cmt-call').className = 'selected';
		if( $('from_phone') ) {
			document.CallForm.from_phone.focus();
		}
	}
	
}

EOL.contactme.addtowatchlist = function(userid,username) {
   EOL.contactme.close();
   EOL.addtolist.open(userid,username,'S');
}

EOL.contactme.createNewJob = function(url) {
	window.location.href = url;
};

var callSessionId;
var callWS;
var checkTabsLoadedInterval;

var URL_BASE;
function connectCall(from_phone, username, url_base){
    URL_BASE = url_base;
    clearStatus();
    var result=true;
    if(callSessionId=="IN-PROGRESS"){
        result=confirm("Call in progress, making another call may disonnect the current call. Do you want to continue?");
    }
    if(result){
        if(!validatePhone(from_phone)){
            return;
        }
        from_phone = document.CallForm.from_phone.value;
        callSessionId="IN-PROGRESS";
        setCallStatus("Connecting...");
        //Connect Call, get Session ID
        var url = "/php/myelance/main/call.php?ctx=contactMe&mode=call&view_person="+username+"&from_phone="+from_phone+'&t='+getDateTime();
        var request = new Request({ url: url, 
        							method: 'get',
									onSuccess: callResult,
									onFailure: callFailure
								   }).send();
        $('cancelCall').removeClass('displayNone');
    }
}

function validatePhone(phone){
		var p = phone.replace(/[^\d\+]/g, "");
		if (p.substr(0, 3) != "011" && p.substr(0, 1) != "+") {
			if (p == "911") {
				alert("Calls to 911 emergency services cannot be completed. Please dial the number directly from your landline or cell phone");
				document.CallForm.from_phone.focus();
				return false;
			}
			if (p == "411") {
				alert("Calls to 411 directory assistance services cannot be completed. Please dial the number directly from your landline or cell phone");
				document.CallForm.from_phone.focus();
				return false;
			}
			if (!p.match(/^\+?1?[2-9]\d{2}[2-9]\d{6}$/)) {
				alert("The phone number you entered is incorrect.\n\n" +
							"Valid US phone numbers should be a total of 10-digits in length\n" +
							"and neither the area code or 7-digit phone number can start with the number \"1\".");
				document.CallForm.from_phone.focus();
				return false;
			}
		}
		if (p.substr(0, 1) == "+") p = p.substr(1);
        document.CallForm.from_phone.value = p;
	return true;
}

function cancelCall(){
    if(callSessionId){
        if(callSessionId!='IN-PROGRESS'){
        //disconnect call
        var answer = confirm("Call is in progress. Do you want to disconnect?");
        if(answer){
            var url = "/php/myelance/main/call.php?ctx=contactMe&mode=cancel&call_sk="+callSessionId+'&call_WS='+callWS+'&t='+getDateTime();
            var request = new Request({ url: url, 
            							method: 'get',
										onSuccess: function() {},
										onFailure: function() {}
								   }).send();
        }else{
            return;
        }
        }
        callSessionId=null;
    }
    clearStatus();
    $('cancelCall').addClass('displayNone');
}

function callResult(tspt){
   var response = tspt;
   var data = response.split(' ');
   if(data[0]=='OK'){
       callSessionId=data[1];
       callWS = data[2];
       //initiate call status
       setCallStatus("");
       getCallStatus();
       isCallInProgress();
   }else{
       //TODO - Set Error Message
    setCallStatus(response);
    callSessionId=null;
   }
}
function clearStatus(){
    setCallStatus("");
    var sframe = $('callStatusFrame');
    sframe.src="";
}
function callFailure(){
    setCallStatus("<span class='errortext'> Internal Error, cannot connect call, please try again at a later time. ");
    callSessionId=null;
}

//get call status from provider
function getCallStatus(){
    if(callSessionId!=null){
        var iframe = "https://service.ringcentral.com/ringout.asp?cmd=status&format=html&css="+escape(URL_BASE+"/styles/ringCentralStatus.css")+"&sessionid="+callSessionId+"&WS="+callWS+'&t='+getDateTime();
        var sframe = $('callStatusFrame');
        sframe.src=iframe;
        setTimeout("getCallStatus()", 5000);
    }
}

function isCallInProgress(){
    if(callSessionId){
    	var request = new Request(
    							 {	url: '/php/myelance/main/call.php?ctx=contactMe&mode=status&call_sk='+callSessionId+'&call_WS='+callWS+'&t='+getDateTime(),
    							 	method: 'get',
									onSuccess: updCallSession,
									onFailure: updCallSession
								   }).send();
      setTimeout("isCallInProgress()", 30000);
    }
}

function updCallSession(tspt){
   if(!tspt || tspt!=1){
       callSessionId=null;
   }
}

function setCallStatus(statusText){
    $('callStatus').innerHTML="<div style='float:left;'><b>Call Status</b>:</div><div style='float:left'>"+statusText+"</div>";
}

function saveChatStatus(){
	availablestatus = document.getElementsByName("availability");
	if(availablestatus[0].checked) {
		toggleChatStatus('1');
		$('available').attributes['onclick'].value = '';
		$('notavailable').attributes['onclick'].value = 'javascript:enableChatStatus();';
	} else {
		toggleChatStatus('0');
		$('notavailable').attributes['onclick'].value = '';
		$('available').attributes['onclick'].value = 'javascript:enableChatStatus();';
	}
	$('confirmdiv').removeClass('displayNone');
	$('save_action').addClass('btn-small-disabled');
	$('save_action').removeClass('btn-small-normal');
	$('save_action').attributes['href'].value = 'javascript:void(0)';
}

function enableChatStatus(){
	$('save_action').addClass('btn-small-normal');
	$('save_action').removeClass('btn-small-disabled');
	$('save_action').attributes['href'].value = 'javascript:saveChatStatus();';
}

function cancelChatStatus(){
	window.location.href = '/settings';
}

function toggleChatStatus(chatState){
        var username = getCookie("userid");
        var d = new Date();
        var request = new Request({ url: '/php/userplane/main/chat.php?ctx=myelance&userid='+username + '&chatstate=' + chatState + '&t='+d.getTime(), 
        							method: 'get',
									onSuccess: updateMyElanceChat,
									onFailure: function() {}
								   }).send();
}

function updateMyElanceChat(resp){
    if(resp.length >0){
		var resObj = eval('({' + resp + '})');
		if(resObj.prefEnabled != 'N'){
			if($("EnableChatSubText")) {
				document.getElementById("EnableChatSubText").innerHTML = resObj.html;
				document.getElementById("EnableChatSubText").href = 'javascript:toggleChatStatus(\'' + resObj.state + '\');';
			}
		}
        
	} else {
		alert('Failed to Toggle your chat status, please call Elance customer support and report this problem.');
	}

}


/*** AGENT STUFF ***/

// Turn on extra stuff for agent mode
function activateContactMeAgentMode(){
	$('agentNotice').removeClass('displayNone');
	$('inviteAgentSuccessMessage').removeClass('displayNone');
}

// turn off extra stuff for agent mode. Called when the panel is closed
function deactivateContactMeAgentMode(){
	$('agentNotice').addClass('displayNone');
	$('inviteAgentSuccessMessage').addClass('displayNone');
}

function trackInviteUser(buyerId, sellerId, jobId, source)
{
    var params = {
        userId: buyerId,
        logEntries: {
            freelancerId: sellerId,
            jobId: jobId
        }
    };
    if (source.length) {
        if (source.indexOf('.') > 0) {
            var s = source.split('.');
            params.pageName = s[0];
            params.metricTags = {
                area: s[1]
            };
        } else {
            params.pageName =  source ;
        }
    }
    $el('send', 'userAction', 'INVITE', 'Freelancer', params);
}

function inviteUser(buyerId, sellerId, /* optional */ catId, source) {

	if(!catId) catId = null;
	if(!source) source = '';

	// Find the checked jobid [only 1!]
    var jobId;
	i = 0;
	while ($('existing'+i)) {
		if ($('existing'+i).checked) {
			jobId = $('existingId'+i).value;
            inviteLimitReached = $('existingId'+i).get('data-inviteLimitReached');
            if (inviteLimitReached){
                EOL.contactme.dialog.hide();
                EOL.contactme.showFeaturedUpsellMaxInvitesReachedModal(jobId);
                return;
            }
			break;
		}
		++i;
	}

	// if we're inviting multiple sellers, this will comma deliminate them
	sellerId = sellerId.toString();

	// If we have dont have a checked job, we need to go to post project
	if (!jobId) {
        trackInviteUser(buyerId, sellerId, 'new', source);
		EOL.contactme.createNewJob('/postjob?inviteId='+ sellerId.replace(/,/g, '_') + '&catId=' + catId + '&inviteSource=' + source);
        EOL.contactme.signals.newJob.dispatch();
		return;
	}

	// find all checked agents [could multiple]
	var agentList = new Array();
	var e = document.getElementsByName("inviteAgent");
	for(var i = 0; i < e.length; i++){
		if( e[i].checked ){
			agentList.push( e[i].value );
		}
	}
	var agentIds = agentList.toString();

	var bidPref;
	var setBidPref = 'N';
	var prefSet = document.getElementById('bidPref');
	if(prefSet && (prefSet.innerHTML).replace(/^\s+|\s+$/g,"") != '') {
		setBidPref = 'Y';
		chkBox = document.getElementsByName('accept_other_candidates');
		bidPref = (chkBox[0].checked) ? 'Y' : 'N';
	}

	// make the ajax request
	if (jobId) {	
		$('existingProjectButton').addClass('btn-large-disabled').removeClass('btn-large-normal');
		$('cancelButton').addClass('btn-large-disabled').removeClass('btn-large-secondary');

        trackInviteUser(buyerId, sellerId, jobId, source);
		var request = new Request.JSON({ url:'/php/profile/main/inviteAHR.php?action=invite&jobId='
										+jobId+'&buyerId='+buyerId+
										'&sellerId='+sellerId+
										'&setBidPref='+setBidPref+
										'&bidPref='+bidPref+
										'&agentIds='+agentIds+
										'&source='+source+
										'&t=' + getDateTime(), 
									method: 'get',
									onSuccess: function(response) {
										inviteSuccess(response, jobId)
									},
									onFailure: function() {
										$('existingProjectButton').removeClass('btn-large-disabled').addClass('btn-large-normal');
										$('cancelButton').removeClass('btn-large-disabled').addClass('btn-large-secondary');										
									}
					   }).send();
	}
}

function inviteSuccess(result, jobId) {

	if (result.status == 'success') {
		var url = '/job/' + jobId + '/popup/inviteConfirm';
		new Request.JSONP({
			url: url,
			method: 'GET',
			data: {
				t: new Date().getTime(),
				result: {
					sent: result.data.sent,
					already: result.data.already,
					bidPlacedAlready: result.data.bidPlacedAlready,
					invalid: result.data.invalid,
					own: result.data.own,
					unavailable: result.data.unavailable,
					overLimit: result.data.overLimit
				}
			},
			onComplete: function() {
				$('existingProjectButton').removeClass('btn-large-disabled').addClass('btn-large-normal');
				$('cancelButton').removeClass('btn-large-disabled').addClass('btn-large-secondary');
			},
			onSuccess: function(r) {
				EOL.contactme.dialog.hide();
				EOL.popups.dialog = new EOL.dialog(r.html);
				EOL.popups.dialog.show();
			}
		}).send();

        EOL.contactme.signals.invite.dispatch();

	} else {
		$('inviteSuccessMessage').style.display = 'none';
		$('inviteFailureMessage').style.display = 'block';
		$('inviteContent').style.display = 'none';
	}
}


function getBidAcceptPreference() {
	var sellerid = $('sellerid').value;
	var id = $$('input[name=projectChoice]:checked')[0].get('value');
	var jobid = $('existingId'+id).value;
	if(jobid) {
		var request = new Request({ url:'/php/profile/main/inviteAHR.php?action=getBidAcceptPreference&jobid='
							+jobid+'&sellerid='+sellerid+
                                                                                '&t=' + getDateTime(),
                                                                        method: 'get',
                                                                        onSuccess: bidAcceptPreferenceSuccess,
                                                                        onFailure: function() {}
                                           }).send();

	}
}


function bidAcceptPreferenceSuccess(response) {
	var result = eval('('+ response +')');
	var bidPref = $('bidPref');
	if(result.data.showBidAcceptPref) {
		bidPref.innerHTML = '<label for="accept_other_candidates"><input type="checkbox" name="accept_other_candidates" value="1" checked />&nbsp;&nbsp;I am willing to accept proposals from other candidates in this company.</label>';
	}
	else {
		bidPref.innerHTML = '';
	}
}

    /* autoinvite related functions */

	EOL.contactme.autoInviteUser = function (jobId, buyerId, sellerId) {

            source = 'FreelancerRecEmail';

            var jobId;
            i = 0;
			inviteLimitReached = false;
			//TODO - take care of the limit case
			if (inviteLimitReached) {
				EOL.contactme.showFeaturedUpsellMaxInvitesReachedModal(jobId);
				return;
			}

            // if we're inviting multiple sellers, this will comma deliminate them
            sellerId = sellerId.toString();

            if (!jobId) {
                return;
            }

            // find all checked agents [could multiple]
            var agentList = new Array();
            var e = document.getElementsByName("inviteAgent");
            for(var i = 0; i < e.length; i++){
                if( e[i].checked ){
                    agentList.push( e[i].value );
                }
            }
            var agentIds = agentList.toString();

            // make the ajax request
            if (jobId) {

                trackInviteUser(buyerId, sellerId, jobId, source);
                var request = new Request.JSON({ url:'/php/profile/main/inviteAHR.php?action=invite&jobId='
                                                +jobId+'&buyerId='+buyerId+
                                                '&sellerId='+sellerId+
                                                '&agentIds='+agentIds+
                                                '&source='+source+
                                                '&t=' + getDateTime(),
                                            method: 'get',
                                            onSuccess: function(response) {
                                                EOL.contactme.autoInviteSuccess(response, jobId)
                                            },
                                            onFailure: function() {
												alert('Oops, we cannot process your request at this time');
                                            }
                               }).send();
            }
    }


	EOL.contactme.autoInviteSuccess = function(result, jobId) {
            if (result.status == 'success') {
                var url = '/job/' + jobId + '/popup/inviteConfirm';
                new Request.JSONP({
                    url: url,
                    method: 'GET',
                    data: {
                        t: new Date().getTime(),
                        result: {
                            sent: result.data.sent,
                            already: result.data.already,
                            bidPlacedAlready: result.data.bidPlacedAlready,
                            invalid: result.data.invalid,
                            own: result.data.own,
                            unavailable: result.data.unavailable,
                            overLimit: result.data.overLimit
                        }
                    },
                    onSuccess: function(r) {
                        EOL.popups.dialog = new EOL.dialog(r.html);
                        EOL.popups.dialog.show();
                    }
                }).send();

                EOL.contactme.signals.invite.dispatch();

            } else {
                alert('Something went wrong. We cannot process your request');
            }
    }

	/* END - autoinvite related functions */



EOL.namespace('emailFriend');

EOL.emailFriend.dialog = null;
EOL.emailFriend.confDialog = null;

EOL.emailFriend.open = function(objId, objUrl, objType, msg, share, refer, source_page) {
	if(!objType)
		objType = 'project';
	
	var msgData = '';
	if(msg) {
		msgData = '&msg='+encodeURIComponent(msg);
	}
	
	if(!$('emailFriendCss'))
		Asset.css('/styles/myelance/emailFriend.css,/share.css',{id:'emailFriendCss'});
		
	var postData = 'action=dialog&objId='+escape(objId)+'&objUrl='+escape(objUrl)+'&objType='+escape(objType)+msgData+ (share ? '&share=1' : '') + (refer ? '&refer=1' : '') + (source_page ? '&source='+escape(source_page) : '');
	var request = new Request({	url: '/php/promo/main/emailToFriend.php?t=' + getDateTime(), 
								method: 'post',
								data: postData,
								onSuccess: function(req) {
									EOL.emailFriend.dialog = new EOL.dialog(req, {position: 'fixed', modal:true, close:true});
									EOL.emailFriend.dialog.show();
									if($('emailtemplate')) {
										var content = EOL.utility.htmlspecialchars_decode($('emailtemplate').innerHTML);
										$("emailbody").value = content.replace(/<br>/gi,'\n')+'\n';
										simpleTextCounterNegative($('emailbody'),$('charLimit'),1000);
									}
									
								},
								onFailure: function() {}
							   }).send();
	
}

EOL.emailFriend.submit = function() {
	var postData = $('emailfriendform').toQueryString();

	var options = {
		url: '/php/promo/main/emailToFriend.php?t=' + getDateTime(), 
		method: 'post',
		data: postData,
		onSuccess: function(response) {
		    if(response.match(/Error/i)){
		    	$('emailErrorMsg').set('html', response).removeClass('displayNone');
			}else{
				var title = $('emailsuccesstitle').innerHTML;
				var content = '<div style="font-size:13px;">' + response+$('emailwhatnext').innerHTML + '</div>';
				title = '<h1 class="conf" style="margin-bottom:20px;">' + title + '</h1>';
				var close = '<a onclick="EOL.emailFriend.confDialog.hide(); return false" href="#" class="btn-large btn-large-normal" style="margin-top:30px;"><span>Close</span></a>';
				var html = title + content + close; 
				EOL.emailFriend.close();
				EOL.emailFriend.confDialog = new EOL.dialog(html, {position: 'fixed', modal:true, width: 300, close:true});
				EOL.emailFriend.confDialog.show();
			}
		}, 
		onFailure: function() {alert('There was an error processing your request. Please try again.')}
	};
	
	var req = new Request(options);
	$('emailErrorMsg').addClass('displayNone');
	req.send();
}

EOL.emailFriend.close = function() {
	EOL.emailFriend.dialog.hide();
}

EOL.emailFriend.handleEmailListChange = function() {
	EOL.emailFriend.emailCounter();
	EOL.emailFriend.enableDisableActionButton();
}

EOL.emailFriend.emailCounter = function() {
	var arr  = $('recipient_list').value.split(',');
	var total = arr.length - 1;

	var remainingCount = 100 - total;
    var text = remainingCount + ' Email(s)';
    var color = '';
    if(remainingCount < 0) {
        //text = "-" +(count - 100 )+ ' Email(s)';
        color = "#FF0000";
    } else {
        //text = count + ' Email(s)';
        color = "#50852C";
    }
    $('totalEmailCount').innerHTML = text;
    $('totalEmailCount').setStyle('color', color);

}


EOL.emailFriend.enableDisableActionButton = function() {
	if($('recipient_list').value) {
		$('action-button-enabled').setStyle('display', '');
		$('action-button-disabled').setStyle('display', 'none');
	} else {
		$('action-button-enabled').setStyle('display', 'none');
        $('action-button-disabled').setStyle('display', '');
	}
}

EOL.emailFriend.showError = function (error){
	$('emailErrorMsg').removeClass('displayNone');
	$('emailErrorMsg').innerHTML = error;
}

EOL.emailFriend.clearAndHideError = function() {
	$('emailErrorMsg').innerHTML = '';
	$('emailErrorMsg').addClass('displayNone');
}


EOL.emailFriend.closeTemporary = function() {
	Cookie.write('emailMessage', $('emailbody').value);
	Cookie.write('emailAddresses' ,$('recipient_list').value);
	Cookie.write('contactCounter', $('google_imported').value + ':' + $('yahoo_imported').value + ':'+ $('hotmail_imported').value);
	EOL.emailFriend.dialog.hide();
}

EOL.emailFriend.bringBackTemporary = function(newImports) {
	EOL.emailFriend.dialog.show();
	// email message and receipients
	$('emailbody').value = Cookie.read('emailMessage');

	// update email address list
	$('recipient_list').value = Cookie.read('emailAddresses') ? Cookie.read('emailAddresses') : '';
	$('emailbody').onchange();

	// update the import counter
	if(newImports > 0 ) {
		setTimeout(function() {$('recipient_list').highlight()}, 300);
	}


    // restore the import counters
    var counters = Cookie.read('contactCounter').split(':');
    $('google_imported').value = counters[0];
    $('yahoo_imported').value = counters[1];
    $('hotmail_imported').value = counters[2];

	if(newImports > 0 ) {
	    var platform = $('platform').value;
    	//alert('pl-' + platform);
	    $( platform + '_imported').value = parseInt($( platform + '_imported').value) + parseInt(newImports);
		Cookie.write('contactCounter', $('google_imported').value + ':' + $('yahoo_imported').value + ':'+ $('hotmail_imported').value);
	}

	EOL.emailFriend.handleEmailListChange();

	$('recipient_list').addClass('share-email-dirty');
}

EOL.emailFriend.handleContactPicker = function(source) {
	if(!$('oauthJs')) {
        Asset.javascript('/scripts/util/oauth.js',
							{id:'oauthJs',
							onLoad: function(){
								EOL.contactPicker.importContacts(source);
								return;
							}
							}
						);
	}

	EOL.contactPicker.importContacts(source);

}

/* CONTACT PICKER RELATED FUNCTIONALITY
*
*/

EOL.namespace('contactPicker');

EOL.contactPicker.dialog = null;
EOL.contactPicker.contacts = null;

EOL.contactPicker.importContacts = function(source) {

	if(source == 'google') { 
		EOL.oauth.google.userConsent();
	} else if(source == 'yahoo') {
		EOL.oauth.yahoo.handleImportContacts();
	} else if(source == 'hotmail') {
		EOL.oauth.live.userConsent();
	}
}

/* CONTACT PICKER UI FUNCTIONALITY
*
*/

EOL.contactPicker.loading = null;

EOL.contactPicker.showLoading = function(platform) {

	// clear the arrays
	EOL.contactPicker.contacts = new Array();
	EOL.contactPicker.filteredContacts = new Array();
	
    // render ahr request
    var action = 'contactsloading';
    var postData = 'action='+ action +'&platform='+ platform ;
    var request = new Request({ url: '/php/framework/main/contactPicker.php?t=' + getDateTime(),
                                method: 'post',
                                data: postData,
                                onSuccess: function(obj) {
                                    var res = eval('(' + obj + ')');
                                    if(res.status == 'error') {
                                        // handle error
                                    } else {

                                            EOL.contactPicker.dialog = new EOL.dialog(res.data.html, {position: 'fixed', modal:true, close:true, 'afterHide': function() {EOL.contactPicker.closeForm(); } });
                                            EOL.contactPicker.dialog.show();
                                    }
                                },
                                onFailure: function() {
                                    EOL.emailFriend.bringBackTemporary();
                                    EOL.emailFriend.showError("There was an error processing your request. Please try again.");
                                }
                               }).send();


}

EOL.contactPicker.searchReset = true;

EOL.contactPicker.search= function() {
    var keyword = $('search-input').value;
	if(keyword == 'Search' ) {
        return;
    }

    if(!keyword || keyword == '' || keyword == null) {
		if(!EOL.contactPicker.searchReset) {
			EOL.contactPicker.resetContactsList();
			EOL.contactPicker.renderContacts();
		}
		return;
	}

	// set filtered contacts list
	EOL.contactPicker.filteredContacts = new Array();
	var j=0;
	for(var i=0; i < EOL.contactPicker.contacts.length; i++) {
		if(EOL.contactPicker.contacts[i].search.toLowerCase().indexOf(keyword.toLowerCase()) >= 0) {
			EOL.contactPicker.filteredContacts[j] = EOL.contactPicker.contacts[i];
			j++;
		}
	}
	EOL.contactPicker.searchReset = false;

	// Render the contacts now
	EOL.contactPicker.renderContacts();
    EOL.contactPicker.updateSelectedCount();
}

EOL.contactPicker.resetContactsList = function() {
	EOL.contactPicker.filteredContacts = EOL.contactPicker.contacts;
	EOL.contactPicker.searchReset = true;
}

EOL.contactPicker.isChecked = function(email) {
    for(var i=0; i < EOL.contactPicker.contacts.length; i++) {
        if(EOL.contactPicker.contacts[i].email == email) {
			if(EOL.contactPicker.contacts[i].checked == true)
				return true;
			else
				return false;
        }
    }
	return false;
}

EOL.contactPicker.renderContacts = function() {
	var html = '<div id="import-results-list">';
	for (var i = 0; i < EOL.contactPicker.filteredContacts.length; i++) {
		var name = EOL.contactPicker.filteredContacts[i].name;
		var email = EOL.contactPicker.filteredContacts[i].email;
		var isChecked = EOL.contactPicker.isChecked(email);
		html += '<div class="contact-item" style="background-color:' + (i%2==0 ? '#FFFFFF' : '#F5F5F5')+ ';" id="contact_item_'+ i + '" value="' + name + ' ' + email + '">' +
			        '<div class="contact-checkbox left">' +
						'<input type="checkbox" id="contact_item_cbox_' + i + '" name="contact_item_cbox" value="' + email + '" onclick="EOL.contactPicker.handleCheckboxClick(this);"'+ (isChecked ? ' checked' : '') +' />' +
			        '</div>' +
					'<div class="contact-name left" title="'+ name +'">'+ EOL.contactPicker.truncate(name, 22) +'</div>' +
					'<div class="contact-email left" title="'+ (name!=email ? email : '') +'">'+ (name!=email ? EOL.contactPicker.truncate(email, 29): '') +'</div>' +
					'<div class="clear"></div>' +
				'</div>' +
				'<div class="clear"></div>';
	}
	html+= '</div>';
	$('import-results').innerHTML = html;
	$('import-results-list').setStyle('opacity', 0 );
	var contactsFx = new Fx.Tween('import-results-list');
	contactsFx.start('opacity', 0, 1);
}

EOL.contactPicker.truncate = function(str, length) {
	if (str.length > length)
		return str.substring(0,length)+'...';
	else
		return str;
}

EOL.contactPicker.handleCheckboxClick = function(chkBox) {
	for(var i=0; i< EOL.contactPicker.contacts.length ;i++) {
		if(chkBox.value == EOL.contactPicker.contacts[i].email) {
			if(chkBox.checked)
				EOL.contactPicker.contacts[i].checked = true;
			else
				EOL.contactPicker.contacts[i].checked = false;
			break;
		}
	}
	EOL.contactPicker.updateSelectedCount();
}

EOL.contactPicker.updateSelectedCount = function() {
	var selected = EOL.contactPicker.getAllSelected();
    var count = selected.length;
    $('selected_count').value = count;
	if(count>0) {
		$('select_button').setStyle('display', 'block');
		$('select_button_grey').setStyle('display', 'none');
	    $('select_button_copy').innerHTML = 'Select '+ count + ' Friend(s)';
	} else {
		$('select_button').setStyle('display', 'none');
		$('select_button_grey').setStyle('display', 'block');
	}

	var remainingCount = 100 - count;
	var text = remainingCount + ' Email(s)';
	var color = '';
	if(remainingCount < 0) {
		//text = "-" +(count - 100 )+ ' Email(s)';
		color = "#FF0000";
		$('contactPickerError').setStyle('display', '');
	} else {
		//text = count + ' Email(s)';
		color = "#50852C";
		$('contactPickerError').setStyle('display', 'none');
	}
    $('selected_emails_text').innerHTML = text;
	$('selected_emails_text').setStyle('color', color);
}

EOL.contactPicker.getAllSelected = function() {
	var selected = new Array();
	var j=0;
	for(var i=0; i< EOL.contactPicker.contacts.length ;i++) {
		if(EOL.contactPicker.contacts[i].checked === true) {
			selected[j++] = EOL.contactPicker.contacts[i].email;
		}
	}
	return selected;
}


EOL.contactPicker.closeForm = function() {
//	alert('closeform called');
    EOL.emailFriend.bringBackTemporary();
	EOL.contactPicker.dialog.hide();
}

EOL.contactPicker.submitForm = function() {
//	alert('submitform called');
	// append the selected contacts in cookie
    var selectedList = EOL.contactPicker.getAllSelected();
    Cookie.write('emailAddresses', (Cookie.read('emailAddresses')? Cookie.read('emailAddresses') + ', ':'') + selectedList.join(', '));

	var newImports = selectedList.length; 
    EOL.emailFriend.bringBackTemporary(newImports);
	EOL.contactPicker.dialog.hide();
}

// CONTACT PICKER GOOGLE RELATED FUNCTIIONS

EOL.contactPicker.handleNextGoogleAction = function() {
	EOL.emailFriend.closeTemporary();
	EOL.contactPicker.showLoading('google');

	// show loading interaction
	EOL.contactPicker.getContacts('google');
}

EOL.contactPicker.contacts = new Array();
EOL.contactPicker.filteredContacts = new Array();

EOL.contactPicker.getContacts = function(platform) {
	// render ahr request
	var action = 'contactslist';
    var postData = 'action='+ action +'&platform='+ platform ;
    var request = new Request({ url: '/php/framework/main/contactPicker.php?t=' + getDateTime(),
                                method: 'post',
                                data: postData,
                                onSuccess: function(obj) {
									var res = eval('(' + obj + ')');
									if(res.status == 'error') {
										// handle error
									} else {

										if(res.data.contactsCount > 0) {
											// set all contacts variable
											EOL.contactPicker.contacts = res.data.contactsList;
											//Initialize filtered list with all contacts
											EOL.contactPicker.resetContactsList();

											EOL.contactPicker.renderContacts();

											$('total_imported').value = res.data.contactsCount;
											$('platform').value = platform;
											// show additional data on dialog regarding dontacts
											$('selected_emails_text').setStyle('display', '');
											$('contactsFoundTitle').setStyle('display', '');
											$('contactsFoundTitle').innerHTML = 'We found '+ res.data.contactsCount +' contacts. Select ones to invite, up to 100 at a time.';
											
											return;
										} else if(res.data.contactsCount == 0 ) {
											error = "No contacts found. You can still invite contacts from other email accounts, or simply type-in their email addresses.";
										} else {
											error = "There was an error processing your request. Please try again.";
										}
										EOL.contactPicker.closeForm();
										EOL.emailFriend.showError(error);
									}
                                },
                                onFailure: function() {
									//EOL.contactPicker.loading.hide();
									EOL.emailFriend.bringBackTemporary();
									EOL.emailFriend.showError("There was an error processing your request. Please try again.");
								}
                               }).send();



	// This is where ir should reset session too...
}


// CONTACT PICKER YAHOO RELATED FUNCTIONS

EOL.contactPicker.handleNextYahooAction = function() {
	EOL.emailFriend.closeTemporary();
    // show loading icon
    EOL.contactPicker.showLoading('yahoo');

    // get yahoo access token and store in mongodb. On success the function calls EOL.contactPicker.getContacts('yahoo'); to render contacts/ 
    EOL.oauth.yahoo.getYahooAccessToken();

    // no need to explicitly call the getContacts here. 
    //EOL.contactPicker.getContacts('yahoo');
}


// CONTACT PICKER HOTMAIL RELATED FUNCTIONS

EOL.contactPicker.handleNextHotmailAction = function() {
    EOL.emailFriend.closeTemporary();
    EOL.contactPicker.showLoading('hotmail');

    // show loading interaction
    EOL.contactPicker.getContacts('hotmail');
}





EOL.namespace('referral');

EOL.referral.share_type = function(url)
{
  /* see php/marketing/modules/ShareUtil.php */
  var pageUTMMap = new Object();
  pageUTMMap.profile="share_profile";
  pageUTMMap.new_profile="share_new_profile";
  pageUTMMap.port_item="share_portfolio_item";
  pageUTMMap.port_search="share_portfolio_item_from_search";
  pageUTMMap.job_post_confirm="share_job_posted";
  //pageUTMMap.proposal_list="share_proposal_list";
  pageUTMMap.elance_job="share_elance_job";
  pageUTMMap.buyer_left_fb="share_buyer_left_fb";
  pageUTMMap.fb_received="share_feedback_received";
  pageUTMMap.bid_sub="share_bid_sub";
  pageUTMMap.skills_test="share_skill_pass";
  pageUTMMap.job_accept="share_job_accept";
  pageUTMMap.landing="landing";

  /* not in php/marketing/modules/ShareUtil.php */
  pageUTMMap.referralprogram="referralprogram";
  //pageUTMMap.modefeedback="mode=feedback";
  for (var key in pageUTMMap) {
    var str = pageUTMMap[key];
    var exp_str = str.replace(/_/g, "\\_");
    var exp = exp_str;
    var regex = new RegExp(exp,"gi");
    if ( url.match(regex) || document.URL.match(regex) ){
      return str;
    }
  }

  var exp = /mode=feedback/gi;
  var regex = new RegExp(exp);
  if ( url.match(regex) || document.URL.match(regex) ){
    return "feedback";
  } 
  exp = /proposal/gi;
  regex = new RegExp(exp);
  if ( url.match(regex) || document.URL.match(regex) ){
    return "share_proposal_list";
  } 
  return false;
}

EOL.referral.click_track = function(share_type,share_name,page_code)
{
  new Request({
    url: '/php/referral/main/trackShareLinkClicks.php',
    method: 'post',
    data: { share_type: share_type, share_name: share_name, page_code: share_type }
  }).send();
}

EOL.referral.share_facebook = function(url, page_code)
{
  var share_type;
  share_type = EOL.referral.share_type(url);
  if(share_type!=false){
    EOL.referral.click_track(share_type,'facebook',page_code);
  }


	if (!page_code) {
		EOL.referral.share_popup(url, 650, 350, 'fbshare');
		return false;
	}
	FB.ui({
		method: 'feed',
		display: 'popup',
		link: url
	}, function(e) {
		if (!e) return;
		EOL.referral.facebook_event(page_code);
	});
	return false;
}

EOL.referral.share_twitter = function(url,page_code)
{
  var share_type;
  share_type = EOL.referral.share_type(url);
  if(share_type==false) return;
  EOL.referral.click_track(share_type,'twitter',page_code);
  return;
}

EOL.referral.share_google = function(url,page_code)
{
  var share_type;
  share_type = EOL.referral.share_type(url);
  if(share_type!=false){
    EOL.referral.click_track(share_type,'google',page_code);
  }

  var gplus_url = 'https://plus.google.com/share?url='+url;
  EOL.referral.share_popup(gplus_url, 680, 490,'gplus');

  return false;
}

EOL.referral.share_popup = function(url, w, h, name)
{
	var x = Math.round(screen.width/2 - w/2);
	var y = 0;
	if (screen.height > h) {
		y = Math.round(screen.height/2 - h/2);
	}
	window.open(url, name, 'scrollbars=yes,resizable=yes,toolbar=no,location=yes,width='+w+',height='+h+',left='+x+',top='+y);
}

EOL.referral.share_email = function(url, msg, objType, objId, isRef, page_code)
{
  var share_type;
  share_type = EOL.referral.share_type(url);

  if(share_type!=false){
    EOL.referral.click_track(share_type,'email',page_code);
  } 

	EOL.emailFriend.open(objId, url, objType, msg, true, isRef, page_code);
	return false;
}

EOL.referral.focus_email = function(el)
{
	el = $(el);
	if (!el.hasClass('share-email-dirty')) {
		var val = el.get('value');
		el.set('noval', val).set('value', '').addClass('share-email-dirty');
	}
}

EOL.referral.blur_email = function(el)
{
	el = $(el);
	if (el.hasClass('share-email-dirty') && !el.get('value').length) {
		el.set('value', el.get('noval')).removeClass('share-email-dirty');
	}
}

EOL.referral.send_email = function()
{
	EOL.referral.focus_email('recipient_list');
	EOL.emailFriend.submit();
	EOL.referral.blur_email('recipient_list');
	return false;
}

EOL.referral.share_link = function()
{
	var content = '<div id="share-dlg" class="loading"></div>';
	EOL.referral.share_link_dlg = new EOL.dialog(content, { position: 'scroll', modal: true, width: 358, close: false});
	EOL.referral.share_link_dlg.show();

	new Request({
		url: '/php/referral/main/shareLinkHTML.php',
		method: 'get',
		onSuccess: function(req) {
			$('share-dlg').removeClass('loading').set('html', req);
			if ($('profileUrl')) {
				$('profileUrl').onclick =
					$('profileUrl').onfocus =
					$('profileUrl').onkeydown =
					$('profileUrl').onkeyup =
						EOL.referral.selectAll;
				if ($('copyProfile')) {
					EOL.referral.clipProfile = new ZeroClipboard.Client();
					EOL.referral.clipProfile.setText($('profileUrl').get('value'));
					EOL.referral.clipProfile.glue('copyProfile', EOL.referral.share_link_dlg.containerEl);
				}
			}
			if ($('elanceUrl')) {
				$('elanceUrl').onclick =
					$('elanceUrl').onfocus =
					$('elanceUrl').onkeydown =
					$('elanceUrl').onkeyup =
						EOL.referral.selectAll;
				if ($('copyElance')) {
					EOL.referral.clipElance = new ZeroClipboard.Client();
					EOL.referral.clipElance.setText($('elanceUrl').get('value'));
					EOL.referral.clipElance.glue('copyElance', EOL.referral.share_link_dlg.containerEl);
				}
			}
		},
		onFailure: function() {}
	}).send();

	return false;
}

EOL.referral.share_link_close = function()
{
	if (EOL.referral.share_link_dlg) {
		EOL.referral.share_link_dlg.hide();
		if (EOL.referral.clipProfile) {
			EOL.referral.clipProfile.destroy();
		}
		if (EOL.referral.clipElance) {
			EOL.referral.clipElance.destroy();
		}
	}
	return false;
}

EOL.referral.selectAll = function()
{
	if (this.setSelectionRange) {
		this.setSelectionRange(0, this.value.length);
	} else {
		var range = this.createTextRange();
		range.collapse(true);
		range.moveStart('character', 0);
		range.moveEnd('character', this.value.length);
		range.select();
	}
}

EOL.referral.share_menu_init = false;

EOL.referral.share_menu = function(ele)
{
	if (!EOL.referral.share_menu_init) {
		$(document).addEvent('click', function(e) {
			if (e.target.hasClass('share_dropdown')) return;
			$$('.share_dropmenu').addClass('displayNone');
		});
		EOL.referral.share_menu_init = true;
	}
	if ($(ele)) $(ele).toggleClass('displayNone');
	return false;
}

EOL.referral.facebook_event = function(page_code, e)
{
	if (e) {
		page_code = $(e.dom).get('page_code');
	}
	new Request({
		url: '/php/referral/main/trackSharesAHR.php',
		method: 'post',
		data: { page: page_code, platform: 'facebook' }
	}).send();
}

EOL.referral.bindFacebook = function() {
	if (!window.FB) {
		setTimeout(EOL.referral.bindFacebook, 100);
		return;
	}
	FB.Event.subscribe('edge.create', EOL.referral.facebook_event);
}

EOL.referral.tweet_event = function(e)
{
	if (!e || !e.target) return;
	var page_code = $(e.target).get('page_code');
	if (!page_code) return;
	new Request({
		url: '/php/referral/main/trackSharesAHR.php',
		method: 'post',
		data: { page: page_code, platform: 'twitter' }
	}).send();
}

EOL.referral.bindTwitter = function() {
	if (!window.twttr) {
		setTimeout(EOL.referral.bindTwitter, 100);
		return;
	}
	twttr.events.bind('tweet', EOL.referral.tweet_event);
}

window.fbAsyncInit = function() {
	if (!$('fb-appid')) return;
	FB.init({
		appId: $('fb-appid').get('text'),
		xfbml: true
	});
}

EOL.referral.loadedTwitter = false;
EOL.referral.loadedFacebook = false;
EOL.referral.boundEvents = false;

$(window).addEvent('load', function() {
	// load twitter js
	if ($('tweetButton') && !window.twttr && !EOL.referral.loadedTwitter) {
		EOL.referral.loadedTwitter = true;
		var js = document.createElement('script');
		js.type = 'text/javascript';
		js.src = document.location.protocol + '//platform.twitter.com/widgets.js';
		js.async = true;
		var s = document.getElementsByTagName('head')[0];
		s.appendChild(js);
	}

	// load facebook js
	if (!window.FB && !EOL.referral.loadedFacebook) {
		EOL.referral.loadedFacebook = true;
		js = document.createElement('script');
		js.type = 'text/javascript';
		js.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
		if (!$('fb-root')) {
			$(document.body).grab(new Element('div', {id:'fb-root'}), 'top');
		}
		$('fb-root').appendChild(js);
	}

	if (EOL.referral.boundEvents) return;

	// bind twitter events
	EOL.referral.bindTwitter();

	// bind facebook like events
	EOL.referral.bindFacebook();

	EOL.referral.boundEvents = true;
});


/*
---

script: Request.JSONP.js

name: Request.JSONP

description: Defines Request.JSONP, a class for cross domain javascript via script injection.

license: MIT-style license

authors:
  - Aaron Newton
  - Guillermo Rauch
  - Arian Stolwijk

requires:
  - Core/Element
  - Core/Request
  - MooTools.More

provides: [Request.JSONP]

...
*/

Request.JSONP = new Class({

	Implements: [Chain, Events, Options],

	options: {/*
		onRequest: function(src, scriptElement){},
		onComplete: function(data){},
		onSuccess: function(data){},
		onCancel: function(){},
		onTimeout: function(){},
		onError: function(){}, */
		onRequest: function(src){
			if (this.options.log && window.console && console.log){
				console.log('JSONP retrieving script with url:' + src);
			}
		},
		onError: function(src){
			if (this.options.log && window.console && console.warn){
				console.warn('JSONP '+ src +' will fail in Internet Explorer, which enforces a 2083 bytes length limit on URIs');
			}
		},
		url: '',
		callbackKey: 'callback',
		injectScript: document.head,
		data: '',
		link: 'ignore',
		timeout: 0,
		log: false
	},

	initialize: function(options){
		this.setOptions(options);
	},

	send: function(options){
		if (!Request.prototype.check.call(this, options)) return this;
		this.running = true;

		var type = typeOf(options);
		if (type == 'string' || type == 'element') options = {data: options};
		options = Object.merge(this.options, options || {});

		var data = options.data;
		switch (typeOf(data)){
			case 'element': data = document.id(data).toQueryString(); break;
			case 'object': case 'hash': data = Object.toQueryString(data);
		}

		var index = this.index = Request.JSONP.counter++;

		var src = options.url +
			(options.url.test('\\?') ? '&' :'?') +
			(options.callbackKey) +
			'=Request.JSONP.request_map.request_'+ index +
			(data ? '&' + data : '');

		if (src.length > 2083) this.fireEvent('error', src);

		Request.JSONP.request_map['request_' + index] = function(){
			this.success(arguments, index);
		}.bind(this);

		var script = this.getScript(src).inject(options.injectScript);
		this.fireEvent('request', [src, script]);

		if (options.timeout) this.timeout.delay(options.timeout, this);

		return this;
	},

	getScript: function(src){
		if (!this.script) this.script = new Element('script', {
			type: 'text/javascript',
			async: true,
			src: src
		});
		return this.script;
	},

	success: function(args, index){
		if (!this.running) return;
		this.clear()
			.fireEvent('complete', args).fireEvent('success', args)
			.callChain();
	},

	cancel: function(){
		if (this.running) this.clear().fireEvent('cancel');
		return this;
	},

	isRunning: function(){
		return !!this.running;
	},

	clear: function(){
		this.running = false;
		if (this.script){
			this.script.destroy();
			this.script = null;
		}
		return this;
	},

	timeout: function(){
		if (this.running){
			this.running = false;
			this.fireEvent('timeout', [this.script.get('src'), this.script]).fireEvent('failure').cancel();
		}
		return this;
	}

});

Request.JSONP.counter = 0;
Request.JSONP.request_map = {};


EOL.namespace('popups');

EOL.popups.dialog = null;

EOL.popups.open = function(url, callback)
{
	var loading = '<div class="popup-loading"></div>';
	EOL.popups.dialog = new EOL.dialog(loading, { position: 'fixed' });
	EOL.popups.dialog.show();

	new Request.JSONP({
		url: url,
		method: 'GET',
		data: { t: new Date().getTime() },
		onSuccess: function(r) {
			EOL.popups.dialog.update(r.html);
			if (callback) callback(r.html);
		}
	}).send();

	return false;
}

EOL.popups.invite = function(url, redirect)
{
	EOL.popups.invite.redirect = redirect;
	EOL.popups.open(url, function(r) {
		if ($('popup-invite-opt-elance')) {
			EOL.popups.invite.selectPage($('popup-invite-opt-elance').set('checked', true));
			EOL.popups.invite.selectTab($$('.popup-invite-tab[rel=recommend]')[0]);
			$('popup-invite-message').onchange();

			EOL.popups.invite.limit = $('elance-invite-limit').get('text');
			EOL.popups.invite.updateInviteCount(0);

			// reinitialize vars
			EOL.popups.invite.inviteList = null;
			EOL.popups.invite.checkRequests = {};
		}
	});

	return false;
}

EOL.popups.featuredUpsellMaxInvitesReached = function(jobId) {
    EOL.featuredUpsell.showMaxInvitesReachedModal(jobId);

    return false;
}

EOL.popups.featuredUpsellGeneric = function(jobId) {
    EOL.featuredUpsell.showGenericFeaturedModal(jobId);
}

EOL.popups.featuredUpsellRelistFeaturedJob = function(jobId) {
    var modal = new EOL.featuredUpsell.relistFeaturedJobModal({
        'jobId':jobId,
        'onRelistSuccess':function(response){
            if (response.data.hasReachedRelistLimit){
                $$('#jobActionsDropDown .action_relist').addClass('displayNone');
            }
            //show confirmation message
						if (!EOL.popups.relistMessage) {
						   EOL.popups.relistMessage = EOL.utility.createConfirmMessage({
						       'subheaderContent':'Your job has been relisted.'
						   });
							 EOL.popups.relistMessage.inject($$('.proposal-page-container')[0], 'top');
						}
						else {
						   EOL.popups.relistMessage.show();
						}
            modal.hide();
            var postedInfo = $('proposal-info-details').getElements('.proposal-spr-posted span.smart-info-container');
            if (postedInfo && postedInfo[0]) {
                postedInfo[0].set('text','Relisted: Just Now');
            }
            var timeLeftInfo = $('proposal-info-items').getElements('.proposal-spr-timeleft span.smart-info-container');
            if (timeLeftInfo && timeLeftInfo[0]) {
                timeLeftInfo[0].set('text','Time Left: '+response.data.timeLeft);
            }

        }
    });
    modal.open();    
}

EOL.popups.featuredUpsellRelistAsFeatured = function(jobId) {
    EOL.featuredUpsell.showRelistAsFeaturedModal(jobId);    
}


EOL.popups.decline = function(url) {
	return EOL.popups.open(url);
}

EOL.popups.award = function(url) {
    /**
     * ugly hack, but a refactor of EOL.dialog is needed to avoid it
     * see https://jira.elance.com/browse/EOL-48816?focusedCommentId=205685&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#comment-205685
     */
    if (EOL.jobTeam && EOL.jobTeam.addToTeamDialogShown){
        return false;
    }
    return EOL.popups.open(url, function(){
        //prebid fixed price date control
        if ($('award-msDate')){
            new Picker.Date($('award-msDate'), {
                positionOffset: {x: -5, y: 5},
                pickerClass: 'datepicker_elance',
                toggle: $('award-msDate-calendar'),
                format: "%m/%d/%Y",
                startDay: 0,
                onSelect: function(dateVal){ EOL.popups.award.prebidCheck(dateVal, 'award-msDate'); }
            });
        }
        //previous terms fixed price date controls
        var i=0;
        while ($('award-msDate_'+i)){
            new Picker.Date($('award-msDate_'+i), {
                positionOffset: {x: -5, y: 5},
                pickerClass: 'datepicker_elance',
                toggle: $('award-msDate-calendar_'+i),
                format: "%m/%d/%Y",
                startDay: 0
            });
            i++;
        }
        //previous terms hourly date control
        if ($('award-endDate')){
            new Picker.Date($('award-endDate'), {
                positionOffset: {x: -5, y: 5},
                pickerClass: 'datepicker_elance',
                toggle: $('award-endDate-calendar'),
                format: "%m/%d/%Y",
                startDay: 0,
                minDate: new Date(),
                onSelect: EOL.popups.award.updateDuration
            });
            //for previous terms, calculate duration
            EOL.popups.award.updateDuration(new Date($('award-endDate').value), 'award-terms-form');
        }
        if ($('award-prebid-form')){
            if (!$('award-reuse-terms') || !$('award-reuse-terms').checked){
                EOL.popups.disable('award-prebid-buttons');
            }
            $$('.award-prebid-input').each(function(item){
               item.addEvent('keyup', EOL.popups.award.prebidCheck);
            });
        }
        if ($('award-reuse-terms')){
            EOL.popups.award.switchTerms($('award-reuse-terms').checked);
        }
    });
};

EOL.popups.award.prebidCheck = function(dateVal, dateFieldId) {
    //if called from calendar, update date input
    if (dateVal instanceof Date && $(dateFieldId)) {
        $(dateFieldId).removeClass("popup-input-default");
    }
    var entered = true;
    $$('.award-prebid-input').each(function(item){
        if (!item.value || item.hasClass("popup-input-default")){
            entered = false;
        }
    });
    if (entered){
        if ($('award-terms-link').hasClass('displayNone')) EOL.popups.enable('award-prebid-buttons');
    }else{
        if (!$('award-terms-link').hasClass('displayNone')) EOL.popups.disable('award-prebid-buttons');
    }
};

EOL.popups.award.updateDuration = function(endDate, formId){
    if (!formId){
        formId = ($('award-previous-terms').hasClass('displayNone')) ? 'award-prebid-form' : 'award-terms-form';
    }
    if (!$(formId)){
        return;
    }

    var startDate = new Date();
    var startTs = startDate.getTime();
    var endTs = endDate.getTime();
    var duration = Math.max(1, Math.ceil((endTs - startTs)/(1000*60*60*24)));//difference in days, minimum 1 day
    var weeks = Math.floor(duration/7);
    var days = duration%7;
    if (weeks > 0){
        $(formId).getElementById('award-duration-weeksNumber').innerHTML = weeks;
        if (weeks == 1){
            $(formId).getElementById('award-duration-week').removeClass('displayNone');
            $(formId).getElementById('award-duration-weeks').addClass('displayNone');
        }else{
            $(formId).getElementById('award-duration-week').addClass('displayNone');
            $(formId).getElementById('award-duration-weeks').removeClass('displayNone');
        }
        $(formId).getElementById('award-duration-weeksNote').removeClass('displayNone');
    }else{
        $(formId).getElementById('award-duration-weeksNote').addClass('displayNone');
    }
    if (days > 0 || weeks == 0){//if there are 0 weeks and 0 days, show "0 days"
        $(formId).getElementById('award-duration-daysNumber').innerHTML = days;
        if (days == 1){
            $(formId).getElementById('award-duration-day').removeClass('displayNone');
            $(formId).getElementById('award-duration-days').addClass('displayNone');
        }else{
            $(formId).getElementById('award-duration-day').addClass('displayNone');
            $(formId).getElementById('award-duration-days').removeClass('displayNone');
        }
        $(formId).getElementById('award-duration-daysNote').removeClass('displayNone');
    }else{
        $(formId).getElementById('award-duration-daysNote').addClass('displayNone');
    }
    $(formId).getElement('div.award-field-note').removeClass('displayNone');
};

EOL.popups.cancel = function(url) {
	EOL.popups.open(url, function(r) {
		$('popup-cancel-comments').onchange();
	});

	return false;
}

EOL.popups.extend = function(url) {
	EOL.popups.open(url, function(r) {
		var minDate = $('popup-extend-min').get('value');
		var maxDate = $('popup-extend-max').get('value');

		var cal = new Picker.Date($('popup-extend-until'), {
			minDate: Date.parse(minDate),
			maxDate: Date.parse(maxDate),
				positionOffset: {x: -5, y: 5},
				pickerClass: 'datepicker_elance',
				toggle: $('popup-extend-calendar'),
				startDay: 0,
				format: "%b %e, %Y"
		});

		$('popup-extend-reason').onchange();
	});

	return false;
}

EOL.popups.closeJob = function(url) {
	EOL.popups.open(url, function(r) {
		$('popup-close-reason').onchange();
	});

	return false;
}

EOL.popups.repost = function(url) {
	EOL.popups.open(url, function(r) {
		var reason = $('popup-repost-close-reason');
		if (reason) reason.onchange();
	});

	return false;
}

EOL.popups.close = function()
{
	if (EOL.popups.confirmDialog) {
		EOL.popups.confirmDialog.hide();
		EOL.popups.confirmDialog = null;
	}
	if (EOL.popups.dialog) {
		EOL.popups.dialog.hide();
	}
	return false;
}

EOL.popups.invite.inviteList = null;

EOL.popups.invite.checkRequests = {};

EOL.popups.invite.initInviteElance = function()
{
	var area = $('invite-elance-area');
	if (!area) return;

	if (area.hasClass('popup-input-default')) {
		area.set('value', '')
			.removeClass('popup-input-default');
	}

	if (EOL.popups.invite.inviteList) return; // already initialized

	var suggestUrl = $('invite-suggest-url');
	if (!suggestUrl) return;
	suggestUrl = suggestUrl.get('value').trim();
	if (!suggestUrl.length) return;

	var checkUrl = $('invite-check-url');
	if (!checkUrl) return;
	checkUrl = checkUrl.get('value').trim();
	if (!checkUrl.length) return;

	EOL.popups.invite.inviteList = new TextboxList('invite-elance-area', {
		max: Math.min(EOL.popups.invite.limit, 50),
		unique: true,
		startEditableBit: false,
		inBetweenEditableBits: false,
		plugins: {
			autocomplete: {
				queryRemote: true,
				placeholder: '',
				remote: {url: suggestUrl}
			}
		},
		bitsOptions: {
			editable: {
				addOnBlur: false
			}
		},
		onBitBoxAdd: function(box)
		{
			if (box.value[0] == null) {
				box.value[0] = box.value[1];
				box.value[2] = '<i>' + box.value[1] + '</i>';
				box.update(box.value);
				box.bit.addClass('textboxlist-bit-box-pending');
			}
			if (box.value && box.bit.hasClass('textboxlist-bit-box-pending')) {
				var s = box.value[0];
				if (EOL.popups.invite.checkRequests[s]) {
					EOL.popups.invite.checkRequests[s].cancel();
				}
				EOL.popups.invite.checkRequests[s] = new Request.JSON({
					url: checkUrl,
					method: 'POST',
					data: { search: s },
					onComplete: function() {
						EOL.popups.invite.checkRequests[s] = null;
					},
					onSuccess: function(r) {
						if (r.status == 'success') {
							box.update(r.data);
							box.bit.removeClass('textboxlist-bit-box-pending');
						} else {
							box.bit.addClass('textboxlist-bit-box-error');
							$('invite-elance-nouser').removeClass('displayNone');
						}
					}
				}).send();
			}
			EOL.popups.invite.updateInviteCount(EOL.popups.invite.inviteList.getValues().length);
		},
		onBitBoxRemove: function(box)
		{
			if (box.value) {
				var s = box.value[0];
				if (EOL.popups.invite.checkRequests[s]) {
					EOL.popups.invite.checkRequests[s].cancel();
				}
			}
			if ($$('.textboxlist-bit-box-error').length < 1) {
				$('invite-elance-nouser').addClass('displayNone');
			}
			EOL.popups.invite.updateInviteCount(EOL.popups.invite.inviteList.getValues().length);
		},
		onBitEditableFocus: function(editable)
		{
			if (editable.textboxlist.getValues().length >= editable.textboxlist.options.max) {
				editable.blur();
			}
        }
	});
	//if (EOL.popups.invite.limit > 0) {
		EOL.popups.invite.inviteList.focusLast();
	//}
}

EOL.popups.invite.updateInviteCount = function(num)
{
	var div = $('elance-invite-limit');
	if (!div) return;

	var left = Math.min(EOL.popups.invite.limit, 50) - num;
	var leftReal = EOL.popups.invite.limit - num;
	div.set('text', leftReal);
	$('invite-elance-limit').toggleClass('popup-limit-reached', leftReal < 1);
	if (left < 1 && EOL.popups.invite.inviteList) {
		EOL.popups.invite.inviteList.blur();
	}
}

EOL.popups.invite.selectTab = function(ele)
{
	ele = $(ele);

	ele.getSiblings('.popup-invite-tab').removeClass('popup-invite-tab-selected');
	ele.addClass('popup-invite-tab-selected');

	var page = $('popup-invite-' + ele.get('rel'));
	if (!page) return false;

	$$('.popup-invite-page').addClass('displayNone');
	page.removeClass('displayNone');

	return false;
}

EOL.popups.invite.selectPage = function(ele)
{
	ele = $(ele);

	if (!ele.get('checked')) return;

	var page = $('popup-invite-' + ele.get('rel'));
	if (!page) return;

	$$('.popup-invite-subpage').addClass('displayNone');
	page.removeClass('displayNone');
}

EOL.popups.invite.sendEmail = function(jobid, url)
{
	var emailInput = $('popup-invite-email');
	if (!emailInput) return false;

	var msgInput = $('popup-invite-message');
	if (!msgInput) return false;

	var data = {
		type: 'email',
		message: msgInput.get('value'),
		emails: emailInput.get('value')
	};

	var copyInput = $('popup-email-copy');
	if (copyInput && copyInput.get('checked')) {
		data.copy = true;
	}

	EOL.popups.invite.send(url, data, 'popup-invite-error');

	return false;
}

EOL.popups.invite.sendElance  = function(jobid, url)
{
	var usersInput = $('invite-elance-area');
	if (!usersInput) return false;

	var last = EOL.popups.invite.inviteList.getBit(EOL.popups.invite.inviteList.list.getLast());
	if (last && last.type == 'editable') {
		last.toBox();
	}

	var users = usersInput.hasClass('popup-input-default') ? '' : usersInput.get('value');

	var data = {
		type: 'elance',
		users: users
	};

	EOL.popups.invite.send(url, data, 'invite-elance-error');

	return false;
}

EOL.popups.confirmDialog = null;

EOL.popups.invite.send = function(url, data, errorDiv)
{
	$(errorDiv).addClass('displayNone');

	EOL.popups.disable('popup-invite-other');

	new Request.JSON({
		url: url,
		method: 'POST',
		data: data,
		onComplete: function() {
			EOL.popups.enable('popup-invite-other');
		},
		onFailure: function() {
			$(errorDiv).set('text', 'Unknown error. Please try again later.').removeClass('displayNone');
		},
		onSuccess: function(r) {
			if (r.html) {
				EOL.popups.confirmDialog = new EOL.dialog(r.html, {
					afterShow: function() {
						var isOk = $('popup-invite-confirm-ok');
						if (isOk) isOk = isOk.get('value');
						EOL.popups.confirmDialog.isOk = isOk;
					},
					afterHide: function() {
						if (!this.goBack) {
							if (EOL.popups.confirmDialog.isOk && EOL.popups.invite.redirect) {
								window.location.href = EOL.popups.invite.redirect;
							} else {
								EOL.popups.close();
							}
						}
					}
				});
				$(EOL.popups.dialog.containerEl).addClass('displayNone');
				EOL.popups.confirmDialog.show();
			} else if (!r.error) {
				r.error = 'Unknown error. Please try again later.';
			}
			if (r.error) {
				$(errorDiv).set('html', r.error).removeClass('displayNone');
			}
		}
	}).send();
}

EOL.popups.invite.back = function()
{
	EOL.popups.confirmDialog.goBack = true;
	EOL.popups.confirmDialog.hide();
	EOL.popups.confirmDialog.goBack = false;
	$(EOL.popups.dialog.containerEl).removeClass('displayNone');

	return false;
}

EOL.popups.decline.reasonChanged = function(ele, other)
{
	var o = $('popup-decline-other-div');
	if (o) {
		var val = $(ele).get('value');
		o.toggleClass('displayNone', val != other);
	}
}

EOL.popups.decline.submit = function(url, bidid, tab)
{
	var reason = $('popup-decline-reason');
	if (!reason) return;
	reason = reason.get('value');

	var other = $('popup-decline-other');
	other = other ? other.get('value') : '';

	$('popup-decline-error').addClass('displayNone');
	EOL.popups.disable('popup-decline');

	new Request.JSON({
		url: url,
		method: 'POST',
		data: {
			reason: reason,
			other: other
		},
		onComplete: function() {
			EOL.popups.enable('popup-decline');
		},
		onFailure: function() {
			$('popup-decline-error').set('text', 'Unknown error. Please try again later.').removeClass('displayNone');
		},
		onSuccess: function(r) {
			if (r.status == 'success') {
				EOL.popups.close();
				EOL.proposals.removeBidCard(bidid, 'declined');
			} else {
				if (!r.error) {
					r.error = 'Unknown error. Please try again later.';
				}
				$('popup-decline-error').set('html', r.error).removeClass('displayNone');
			}
		}
	}).send();

	return false;
};

EOL.popups.award.switchTerms = function(showPrev){
    if (showPrev){
        $('award-bid-terms').addClass('displayNone');
        $('award-previous-terms').removeClass('displayNone');
        if ($('award-prebid-form')){
            if ($('award-terms-link').hasClass('displayNone')) EOL.popups.enable('award-prebid-buttons');
        }
    }else{
        $('award-previous-terms').addClass('displayNone');
        $('award-bid-terms').removeClass('displayNone');
        if ($('award-prebid-form')){
            EOL.popups.award.prebidCheck();
        }
    }
};

EOL.popups.award.updateTermsUrl = function(){
    var url = $('award-terms-url').innerHTML;
    if ($('award-reuse-terms') && $('award-reuse-terms').checked){
        url += '&'+$('award-terms-form').toQueryString();
        url += '&prevTerms=1';
    } else if ($('award-prebid-form')){
        url += '&'+$('award-prebid-form').toQueryString();
    }
    if ($('award-keep-open') && $('award-keep-open').checked){
        url += '&keepOpen=Y';
    }else{
        url += '&keepOpen=N';
    }

    $('award-terms-link').href = url;
};

EOL.popups.award.submit = function(url)
{
	var data = '';

	var keepOpen = $('award-keep-open');
	if (keepOpen && keepOpen.get('checked')) {
		data += '&keepOpen=1';
	}

    var reuseTerms = $('award-reuse-terms');
	if (reuseTerms && reuseTerms.get('checked')) {
        data += '&reuseTerms=1';
        if ($('award-terms-form')){
            data += '&'+$('award-terms-form').toQueryString();
        }
	}else if($('award-prebid-form')){
        data += '&'+$('award-prebid-form').toQueryString();
    }

	$('popup-award-error').addClass('displayNone');
	EOL.popups.disable('popup-award');

	if (typeof(ioGetBlackbox) == "function") {
		var bb_data = ioGetBlackbox();
		if (bb_data.finished) {
			data += '&ioBB=' + bb_data.blackbox;
		}
	}

	new Request.JSON({
		url: url,
		method: 'POST',
		data: data,
		onComplete: function() {
			EOL.popups.enable('popup-award');
		},
		onFailure: function() {
			$('popup-award-error').set('text', 'Unknown error. Please try again later.').removeClass('displayNone');
		},
		onSuccess: function(r) {
			if (r.status == 'success') {
				window.location.href = r.redirect;
			} else {
				if (!r.error) {
					r.error = 'Unknown error. Please try again later.';
				}
				$('popup-award-error').set('html', r.error).removeClass('displayNone');
			}
		}
	}).send();

	return false;
}

EOL.popups.preaward = new Object();

EOL.popups.preaward.submit = function(postUrl, getUrl)
{
    var data = $('preaward-terms-form').toQueryString();

    $('popup-preaward-error').addClass('displayNone');
    EOL.popups.disable('popup-preaward');

    new Request.JSON({
        url: postUrl,
        method: 'POST',
        data: data,
        onComplete: function() {
            EOL.popups.enable('popup-preaward');
        },
        onFailure: function() {
            $('popup-preaward-error').set('text', 'Unknown error. Please try again later.').removeClass('displayNone');
        },
        onSuccess: function(r) {
            if (r.status == 'success') {
                EOL.popups.close();
                EOL.popups.award(getUrl);
            } else {
                if (!r.error) {
                    r.error = 'Unknown error. Please try again later.';
                }
                $('popup-preaward-error').set('html', r.error).removeClass('displayNone');
            }
        }
    }).send();

    return false;
};

EOL.popups.preaward.poSelectChanged = function()
{
    var newPo = $('new-po-box');
    if ($('po-select').get('value') == '+') {
        newPo.removeClass('displayNone');
    } else {
        if (!newPo.hasClass('displayNone')) {
            newPo.addClass('displayNone');
        }
    }
};

EOL.popups.preaward.newPoFocus = function(el)
{
    var value = $(el).get('value');
    var dummyText = $(el).get('data-dummy-text');
    if (value == dummyText) {
        $(el).set('value', '');
        $(el).removeClass('dummy-text');
    }
};
EOL.popups.preaward.newPoBlur = function(el)
{
    var value = $(el).get('value');
    var dummyText = $(el).get('data-dummy-text');
    if (value == '') {
        $(el).set('value', dummyText);
        if (!$(el).hasClass('dummy-text')) {
            $(el).addClass('dummy-text');
        }
    }
};

EOL.popups.cancel.reasonChange = function(ele, other)
{
	var val = '';
	if (ele.get('value') == other) {
		val = $('popup-cancel-required').get('value');
	} else {
		val = $('popup-cancel-optional').get('value');
	}
	var txt = $('popup-cancel-comments');
	if (txt.hasClass('popup-input-default')) {
		txt.set('value', val);
	} else {
		txt.store('default', val);
	}
}

EOL.popups.cancel.submit = function(url,jobid)
{
	var reason = $('popup-cancel-reason');
	if (!reason) return false;
	reason = reason.get('value');

	var comments = $('popup-cancel-comments');
	if (!comments) return false;
	if (comments.hasClass('popup-input-default')) {
		comments = '';
	} else {
		comments = comments.get('value');
	}

	$('popup-cancel-error').addClass('displayNone');
	EOL.popups.disable('popup-cancel');

	new Request.JSON({
		url: url,
		method: 'POST',
		data: {
			reason: reason,
			comments: comments
		},
		onFailure: function() {
			EOL.popups.enable('popup-cancel');
			$('popup-cancel-error').set('text', 'Unknown error. Please try again later.').removeClass('displayNone');
		},
		onSuccess: function(r) {
			if (r.status == 'success') {
				if(EOL.myjobs) {
					window.location.href = '?confirmMode=cancelJob&jobid='+jobid;
				}
				else
					window.location.href = '?confirm=cancel';
			} else {
				EOL.popups.enable('popup-cancel');
				if (!r.error) {
					r.error = 'Unknown error. Please try again later.';
				}
				$('popup-cancel-error').set('html', r.error).removeClass('displayNone');
			}
		}
	}).send();

	return false;
}

EOL.popups.extend.submit = function(url)
{
	var reason = $('popup-extend-reason');
	reason = reason ? reason.get('value') : '';

	var until = $('popup-extend-until');
	if (!until) return;
	until = until.get('value');

	$('popup-extend-error').addClass('displayNone');
	EOL.popups.disable('popup-extend');

	new Request.JSON({
		url: url,
		method: 'POST',
		data: {
			reason: reason,
			until: until
		},
		onFailure: function() {
			EOL.popups.enable('popup-extend');
			$('popup-extend-error').set('text', 'Unknown error. Please try again later.').removeClass('displayNone');
		},
		onSuccess: function(r) {
			if (r.status == 'success') {
				if (EOL.myjobs) {
					window.location.href = '?confirmMode=extendJob&date='+until;
				}
				else
					window.location.href = '?confirm=extend';
			} else {
				EOL.popups.enable('popup-extend');
				if (!r.error) {
					r.error = 'Unknown error. Please try again later.';
				}
				$('popup-extend-error').set('html', r.error).removeClass('displayNone');
			}
		}
	}).send();

	return false;
}

EOL.popups.closeJob.submit = function(url, popup, reason, error, redirect)
{
	if (!reason) reason = 'popup-close-reason';

	reason = $(reason);
	if (!reason) return;
	if (reason.hasClass('popup-input-default')) {
		reason = '';
	} else {
		reason = reason.get('value');
	}

	if (!error) error = 'popup-close-error';
	$(error).addClass('displayNone');
	if (!popup) popup = 'popup-close';
	EOL.popups.disable(popup);

	new Request.JSON({
		url: url,
		method: 'POST',
		data: {
			reason: reason
		},
		onFailure: function() {
			EOL.popups.enable(popup);
			$(error).set('text', 'Unknown error. Please try again later.').removeClass('displayNone');
		},
		onSuccess: function(r) {
			if (r.status == 'success') {
				if(EOL.myjobs && !redirect) {
					redirect = '?confirmMode=closeJob';
				}
				else if (!redirect) {
					redirect = '?confirm=close';
				}
				window.location.href = redirect;
			} else {
				EOL.popups.enable(popup);
				if (!r.error) {
					r.error = 'Unknown error. Please try again later.';
				}
				$(error).set('html', r.error).removeClass('displayNone');
			}
		}
	}).send();

	return false;
}

EOL.popups.repost.submit = function(url, close) {
	var reinviteInvited = $('popup-repost-re-invited');
	if (reinviteInvited && reinviteInvited.get('checked')) {
		url += '&inviteAutoInvite=true';
	}

	var reinviteBid = $('popup-repost-re-bid');
	if (reinviteBid && reinviteBid.get('checked')) {
		url += '&bidAutoInvite=true';
	}

	var doClose = $('popup-repost-close-yes');
	if (doClose && doClose.get('checked')) {
		EOL.popups.closeJob.submit(close, 'popup-repost', 'popup-repost-close-reason', 'popup-repost-error', url);
	} else {
		window.location.href = url;
	}

	return false;
}


EOL.popups.repost.track=function(){
    var userId = getCookie("userid");
        $el('send', 'useraction', "CLICK", 'Job',
            {   "userId": userId,
                "pageName": "JobRepost"

            });
}
EOL.popups.paymentBlock = function(url) {
	return EOL.popups.open(url);
}

EOL.popups.enable = function(id, disable)
{
	var container = $(id);
	if (!container) return;

	container.getElements('.disable-disable').set('disabled', disable);
	container.getElements('.disable-hide').toggleClass('displayNone', disable);
	container.getElements('.disable-show').toggleClass('displayNone', !disable);
}

EOL.popups.disable = function(id)
{
	EOL.popups.enable(id, true);
}

EOL.popups.handleInputDefault = function(ele, focus)
{
	ele = $(ele);
	if (focus && !ele.hasClass('popup-input-default')) {
		return;
	}

	if (focus) {
		ele
			.store('default', ele.get('value'))
			.set('value', '')
			.removeClass('popup-input-default');
	} else if (!ele.get('value').trim().length) {
		ele
			.set('value', ele.retrieve('default'))
			.addClass('popup-input-default');
	}
}

$(window).addEvent('domready', function() {
	var conf = $('confirmInvite');
	if (conf) {
		EOL.popups.confirmDialog = new EOL.dialog(conf.get('html'));
		EOL.popups.confirmDialog.show();
	}
});


// MooTools: the javascript framework.
// Load this file's selection again by visiting: http://mootools.net/more/36a3ed486449b42f7f3a64758a74a6e0 
// Or build this file again with packager using: packager build More/More More/Chain.Wait More/Date More/Date.Extras More/Number.Format More/String.Extras More/String.QueryString More/URI More/Element.Event.Pseudos More/Element.Measure More/Element.Shortcuts More/Assets
/*
 ---
 copyrights:
 - [MooTools](http://mootools.net)

 licenses:
 - [MIT License](http://mootools.net/license.txt)
 ...
 */
MooTools.More={version:"1.4.0.1",build:"a4244edf2aa97ac8a196fc96082dd35af1abab87"};(function(){var a={wait:function(b){return this.chain(function(){this.callChain.delay(b==null?500:b,this);
    return this;}.bind(this));}};Chain.implement(a);if(this.Fx){Fx.implement(a);}if(this.Element&&Element.implement&&this.Fx){Element.implement({chains:function(b){Array.from(b||["tween","morph","reveal"]).each(function(c){c=this.get(c);
    if(!c){return;}c.setOptions({link:"chain"});},this);return this;},pauseFx:function(c,b){this.chains(b).get(b||"tween").wait(c);return this;}});}})();(function(){var b=function(c){return c!=null;
};var a=Object.prototype.hasOwnProperty;Object.extend({getFromPath:function(e,f){if(typeof f=="string"){f=f.split(".");}for(var d=0,c=f.length;d<c;d++){if(a.call(e,f[d])){e=e[f[d]];
}else{return null;}}return e;},cleanValues:function(c,e){e=e||b;for(var d in c){if(!e(c[d])){delete c[d];}}return c;},erase:function(c,d){if(a.call(c,d)){delete c[d];
}return c;},run:function(d){var c=Array.slice(arguments,1);for(var e in d){if(d[e].apply){d[e].apply(d,c);}}return d;}});})();(function(){var b=null,a={},d={};
    var c=function(f){if(instanceOf(f,e.Set)){return f;}else{return a[f];}};var e=this.Locale={define:function(f,j,h,i){var g;if(instanceOf(f,e.Set)){g=f.name;
        if(g){a[g]=f;}}else{g=f;if(!a[g]){a[g]=new e.Set(g);}f=a[g];}if(j){f.define(j,h,i);}if(!b){b=f;}return f;},use:function(f){f=c(f);if(f){b=f;this.fireEvent("change",f);
    }return this;},getCurrent:function(){return b;},get:function(g,f){return(b)?b.get(g,f):"";},inherit:function(f,g,h){f=c(f);if(f){f.inherit(g,h);}return this;
    },list:function(){return Object.keys(a);}};Object.append(e,new Events);e.Set=new Class({sets:{},inherits:{locales:[],sets:{}},initialize:function(f){this.name=f||"";
    },define:function(i,g,h){var f=this.sets[i];if(!f){f={};}if(g){if(typeOf(g)=="object"){f=Object.merge(f,g);}else{f[g]=h;}}this.sets[i]=f;return this;},get:function(r,j,q){var p=Object.getFromPath(this.sets,r);
        if(p!=null){var m=typeOf(p);if(m=="function"){p=p.apply(null,Array.from(j));}else{if(m=="object"){p=Object.clone(p);}}return p;}var h=r.indexOf("."),o=h<0?r:r.substr(0,h),k=(this.inherits.sets[o]||[]).combine(this.inherits.locales).include("en-US");
        if(!q){q=[];}for(var g=0,f=k.length;g<f;g++){if(q.contains(k[g])){continue;}q.include(k[g]);var n=a[k[g]];if(!n){continue;}p=n.get(r,j,q);if(p!=null){return p;
        }}return"";},inherit:function(g,h){g=Array.from(g);if(h&&!this.inherits.sets[h]){this.inherits.sets[h]=[];}var f=g.length;while(f--){(h?this.inherits.sets[h]:this.inherits.locales).unshift(g[f]);
    }return this;}});})();Locale.define("en-US","Date",{months:["January","February","March","April","May","June","July","August","September","October","November","December"],months_abbr:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],days_abbr:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dateOrder:["month","date","year"],shortDate:"%m/%d/%Y",shortTime:"%I:%M%p",AM:"AM",PM:"PM",firstDayOfWeek:0,ordinal:function(a){return(a>3&&a<21)?"th":["th","st","nd","rd","th"][Math.min(a%10,4)];
},lessThanMinuteAgo:"less than a minute ago",minuteAgo:"about a minute ago",minutesAgo:"{delta} minutes ago",hourAgo:"about an hour ago",hoursAgo:"about {delta} hours ago",dayAgo:"1 day ago",daysAgo:"{delta} days ago",weekAgo:"1 week ago",weeksAgo:"{delta} weeks ago",monthAgo:"1 month ago",monthsAgo:"{delta} months ago",yearAgo:"1 year ago",yearsAgo:"{delta} years ago",lessThanMinuteUntil:"less than a minute from now",minuteUntil:"about a minute from now",minutesUntil:"{delta} minutes from now",hourUntil:"about an hour from now",hoursUntil:"about {delta} hours from now",dayUntil:"1 day from now",daysUntil:"{delta} days from now",weekUntil:"1 week from now",weeksUntil:"{delta} weeks from now",monthUntil:"1 month from now",monthsUntil:"{delta} months from now",yearUntil:"1 year from now",yearsUntil:"{delta} years from now"});
(function(){var a=this.Date;var f=a.Methods={ms:"Milliseconds",year:"FullYear",min:"Minutes",mo:"Month",sec:"Seconds",hr:"Hours"};["Date","Day","FullYear","Hours","Milliseconds","Minutes","Month","Seconds","Time","TimezoneOffset","Week","Timezone","GMTOffset","DayOfYear","LastMonth","LastDayOfMonth","UTCDate","UTCDay","UTCFullYear","AMPM","Ordinal","UTCHours","UTCMilliseconds","UTCMinutes","UTCMonth","UTCSeconds","UTCMilliseconds"].each(function(s){a.Methods[s.toLowerCase()]=s;
});var p=function(u,t,s){if(t==1){return u;}return u<Math.pow(10,t-1)?(s||"0")+p(u,t-1,s):u;};a.implement({set:function(u,s){u=u.toLowerCase();var t=f[u]&&"set"+f[u];
    if(t&&this[t]){this[t](s);}return this;}.overloadSetter(),get:function(t){t=t.toLowerCase();var s=f[t]&&"get"+f[t];if(s&&this[s]){return this[s]();}return null;
}.overloadGetter(),clone:function(){return new a(this.get("time"));},increment:function(s,u){s=s||"day";u=u!=null?u:1;switch(s){case"year":return this.increment("month",u*12);
    case"month":var t=this.get("date");this.set("date",1).set("mo",this.get("mo")+u);return this.set("date",t.min(this.get("lastdayofmonth")));case"week":return this.increment("day",u*7);
    case"day":return this.set("date",this.get("date")+u);}if(!a.units[s]){throw new Error(s+" is not a supported interval");}return this.set("time",this.get("time")+u*a.units[s]());
},decrement:function(s,t){return this.increment(s,-1*(t!=null?t:1));},isLeapYear:function(){return a.isLeapYear(this.get("year"));},clearTime:function(){return this.set({hr:0,min:0,sec:0,ms:0});
},diff:function(t,s){if(typeOf(t)=="string"){t=a.parse(t);}return((t-this)/a.units[s||"day"](3,3)).round();},getLastDayOfMonth:function(){return a.daysInMonth(this.get("mo"),this.get("year"));
},getDayOfYear:function(){return(a.UTC(this.get("year"),this.get("mo"),this.get("date")+1)-a.UTC(this.get("year"),0,1))/a.units.day();},setDay:function(t,s){if(s==null){s=a.getMsg("firstDayOfWeek");
    if(s===""){s=1;}}t=(7+a.parseDay(t,true)-s)%7;var u=(7+this.get("day")-s)%7;return this.increment("day",t-u);},getWeek:function(v){if(v==null){v=a.getMsg("firstDayOfWeek");
    if(v===""){v=1;}}var x=this,u=(7+x.get("day")-v)%7,t=0,w;if(v==1){var y=x.get("month"),s=x.get("date")-u;if(y==11&&s>28){return 1;}if(y==0&&s<-2){x=new a(x).decrement("day",u);
    u=0;}w=new a(x.get("year"),0,1).get("day")||7;if(w>4){t=-7;}}else{w=new a(x.get("year"),0,1).get("day");}t+=x.get("dayofyear");t+=6-u;t+=(7+w-v)%7;return(t/7);
},getOrdinal:function(s){return a.getMsg("ordinal",s||this.get("date"));},getTimezone:function(){return this.toString().replace(/^.*? ([A-Z]{3}).[0-9]{4}.*$/,"$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/,"$1$2$3");
},getGMTOffset:function(){var s=this.get("timezoneOffset");return((s>0)?"-":"+")+p((s.abs()/60).floor(),2)+p(s%60,2);},setAMPM:function(s){s=s.toUpperCase();
    var t=this.get("hr");if(t>11&&s=="AM"){return this.decrement("hour",12);}else{if(t<12&&s=="PM"){return this.increment("hour",12);}}return this;},getAMPM:function(){return(this.get("hr")<12)?"AM":"PM";
},parse:function(s){this.set("time",a.parse(s));return this;},isValid:function(s){if(!s){s=this;}return typeOf(s)=="date"&&!isNaN(s.valueOf());},format:function(s){if(!this.isValid()){return"invalid date";
}if(!s){s="%x %X";}if(typeof s=="string"){s=g[s.toLowerCase()]||s;}if(typeof s=="function"){return s(this);}var t=this;return s.replace(/%([a-z%])/gi,function(v,u){switch(u){case"a":return a.getMsg("days_abbr")[t.get("day")];
    case"A":return a.getMsg("days")[t.get("day")];case"b":return a.getMsg("months_abbr")[t.get("month")];case"B":return a.getMsg("months")[t.get("month")];
    case"c":return t.format("%a %b %d %H:%M:%S %Y");case"d":return p(t.get("date"),2);case"e":return p(t.get("date"),2," ");case"H":return p(t.get("hr"),2);
    case"I":return p((t.get("hr")%12)||12,2);case"j":return p(t.get("dayofyear"),3);case"k":return p(t.get("hr"),2," ");case"l":return p((t.get("hr")%12)||12,2," ");
    case"L":return p(t.get("ms"),3);case"m":return p((t.get("mo")+1),2);case"M":return p(t.get("min"),2);case"o":return t.get("ordinal");case"p":return a.getMsg(t.get("ampm"));
    case"s":return Math.round(t/1000);case"S":return p(t.get("seconds"),2);case"T":return t.format("%H:%M:%S");case"U":return p(t.get("week"),2);case"w":return t.get("day");
    case"x":return t.format(a.getMsg("shortDate"));case"X":return t.format(a.getMsg("shortTime"));case"y":return t.get("year").toString().substr(2);case"Y":return t.get("year");
    case"z":return t.get("GMTOffset");case"Z":return t.get("Timezone");}return u;});},toISOString:function(){return this.format("iso8601");}}).alias({toJSON:"toISOString",compare:"diff",strftime:"format"});
    var k=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],h=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];var g={db:"%Y-%m-%d %H:%M:%S",compact:"%Y%m%dT%H%M%S","short":"%d %b %H:%M","long":"%B %d, %Y %H:%M",rfc822:function(s){return k[s.get("day")]+s.format(", %d ")+h[s.get("month")]+s.format(" %Y %H:%M:%S %Z");
    },rfc2822:function(s){return k[s.get("day")]+s.format(", %d ")+h[s.get("month")]+s.format(" %Y %H:%M:%S %z");},iso8601:function(s){return(s.getUTCFullYear()+"-"+p(s.getUTCMonth()+1,2)+"-"+p(s.getUTCDate(),2)+"T"+p(s.getUTCHours(),2)+":"+p(s.getUTCMinutes(),2)+":"+p(s.getUTCSeconds(),2)+"."+p(s.getUTCMilliseconds(),3)+"Z");
    }};var c=[],n=a.parse;var r=function(v,x,u){var t=-1,w=a.getMsg(v+"s");switch(typeOf(x)){case"object":t=w[x.get(v)];break;case"number":t=w[x];if(!t){throw new Error("Invalid "+v+" index: "+x);
    }break;case"string":var s=w.filter(function(y){return this.test(y);},new RegExp("^"+x,"i"));if(!s.length){throw new Error("Invalid "+v+" string");}if(s.length>1){throw new Error("Ambiguous "+v);
    }t=s[0];}return(u)?w.indexOf(t):t;};var i=1900,o=70;a.extend({getMsg:function(t,s){return Locale.get("Date."+t,s);},units:{ms:Function.from(1),second:Function.from(1000),minute:Function.from(60000),hour:Function.from(3600000),day:Function.from(86400000),week:Function.from(608400000),month:function(t,s){var u=new a;
        return a.daysInMonth(t!=null?t:u.get("mo"),s!=null?s:u.get("year"))*86400000;},year:function(s){s=s||new a().get("year");return a.isLeapYear(s)?31622400000:31536000000;
    }},daysInMonth:function(t,s){return[31,a.isLeapYear(s)?29:28,31,30,31,30,31,31,30,31,30,31][t];},isLeapYear:function(s){return((s%4===0)&&(s%100!==0))||(s%400===0);
    },parse:function(v){var u=typeOf(v);if(u=="number"){return new a(v);}if(u!="string"){return v;}v=v.clean();if(!v.length){return null;}var s;c.some(function(w){var t=w.re.exec(v);
        return(t)?(s=w.handler(t)):false;});if(!(s&&s.isValid())){s=new a(n(v));if(!(s&&s.isValid())){s=new a(v.toInt());}}return s;},parseDay:function(s,t){return r("day",s,t);
    },parseMonth:function(t,s){return r("month",t,s);},parseUTC:function(t){var s=new a(t);var u=a.UTC(s.get("year"),s.get("mo"),s.get("date"),s.get("hr"),s.get("min"),s.get("sec"),s.get("ms"));
        return new a(u);},orderIndex:function(s){return a.getMsg("dateOrder").indexOf(s)+1;},defineFormat:function(s,t){g[s]=t;return this;},defineParser:function(s){c.push((s.re&&s.handler)?s:l(s));
        return this;},defineParsers:function(){Array.flatten(arguments).each(a.defineParser);return this;},define2DigitYearStart:function(s){o=s%100;i=s-o;return this;
    }}).extend({defineFormats:a.defineFormat.overloadSetter()});var d=function(s){return new RegExp("(?:"+a.getMsg(s).map(function(t){return t.substr(0,3);
    }).join("|")+")[a-z]*");};var m=function(s){switch(s){case"T":return"%H:%M:%S";case"x":return((a.orderIndex("month")==1)?"%m[-./]%d":"%d[-./]%m")+"([-./]%y)?";
        case"X":return"%H([.:]%M)?([.:]%S([.:]%s)?)? ?%p? ?%z?";}return null;};var j={d:/[0-2]?[0-9]|3[01]/,H:/[01]?[0-9]|2[0-3]/,I:/0?[1-9]|1[0-2]/,M:/[0-5]?\d/,s:/\d+/,o:/[a-z]*/,p:/[ap]\.?m\.?/,y:/\d{2}|\d{4}/,Y:/\d{4}/,z:/Z|[+-]\d{2}(?::?\d{2})?/};
    j.m=j.I;j.S=j.M;var e;var b=function(s){e=s;j.a=j.A=d("days");j.b=j.B=d("months");c.each(function(u,t){if(u.format){c[t]=l(u.format);}});};var l=function(u){if(!e){return{format:u};
    }var s=[];var t=(u.source||u).replace(/%([a-z])/gi,function(w,v){return m(v)||w;}).replace(/\((?!\?)/g,"(?:").replace(/ (?!\?|\*)/g,",? ").replace(/%([a-z%])/gi,function(w,v){var x=j[v];
        if(!x){return v;}s.push(v);return"("+x.source+")";}).replace(/\[a-z\]/gi,"[a-z\\u00c0-\\uffff;&]");return{format:u,re:new RegExp("^"+t+"$","i"),handler:function(y){y=y.slice(1).associate(s);
        var v=new a().clearTime(),x=y.y||y.Y;if(x!=null){q.call(v,"y",x);}if("d" in y){q.call(v,"d",1);}if("m" in y||y.b||y.B){q.call(v,"m",1);}for(var w in y){q.call(v,w,y[w]);
        }return v;}};};var q=function(s,t){if(!t){return this;}switch(s){case"a":case"A":return this.set("day",a.parseDay(t,true));case"b":case"B":return this.set("mo",a.parseMonth(t,true));
        case"d":return this.set("date",t);case"H":case"I":return this.set("hr",t);case"m":return this.set("mo",t-1);case"M":return this.set("min",t);case"p":return this.set("ampm",t.replace(/\./g,""));
        case"S":return this.set("sec",t);case"s":return this.set("ms",("0."+t)*1000);case"w":return this.set("day",t);case"Y":return this.set("year",t);case"y":t=+t;
            if(t<100){t+=i+(t<o?100:0);}return this.set("year",t);case"z":if(t=="Z"){t="+00";}var u=t.match(/([+-])(\d{2}):?(\d{2})?/);u=(u[1]+"1")*(u[2]*60+(+u[3]||0))+this.getTimezoneOffset();
            return this.set("time",this-u*60000);}return this;};a.defineParsers("%Y([-./]%m([-./]%d((T| )%X)?)?)?","%Y%m%d(T%H(%M%S?)?)?","%x( %X)?","%d%o( %b( %Y)?)?( %X)?","%b( %d%o)?( %Y)?( %X)?","%Y %b( %d%o( %X)?)?","%o %b %d %X %z %Y","%T","%H:%M( ?%p)?");
    Locale.addEvent("change",function(s){if(Locale.get("Date")){b(s);}}).fireEvent("change",Locale.getCurrent());})();Date.implement({timeDiffInWords:function(a){return Date.distanceOfTimeInWords(this,a||new Date);
},timeDiff:function(f,c){if(f==null){f=new Date;}var h=((f-this)/1000).floor().abs();var e=[],a=[60,60,24,365,0],d=["s","m","h","d","y"],g,b;for(var i=0;
                                                                                                                                                 i<a.length;i++){if(i&&!h){break;}g=h;if((b=a[i])){g=(h%b);h=(h/b).floor();}e.unshift(g+(d[i]||""));}return e.join(c||":");}}).extend({distanceOfTimeInWords:function(b,a){return Date.getTimePhrase(((a-b)/1000).toInt());
    },getTimePhrase:function(f){var d=(f<0)?"Until":"Ago";if(f<0){f*=-1;}var b={minute:60,hour:60,day:24,week:7,month:52/12,year:12,eon:Infinity};var e="lessThanMinute";
        for(var c in b){var a=b[c];if(f<1.5*a){if(f>0.75*a){e=c;}break;}f/=a;e=c+"s";}f=f.round();return Date.getMsg(e+d,f).substitute({delta:f});}}).defineParsers({re:/^(?:tod|tom|yes)/i,handler:function(a){var b=new Date().clearTime();
        switch(a[0]){case"tom":return b.increment();case"yes":return b.decrement();default:return b;}}},{re:/^(next|last) ([a-z]+)$/i,handler:function(e){var f=new Date().clearTime();
        var b=f.getDay();var c=Date.parseDay(e[2],true);var a=c-b;if(c<=b){a+=7;}if(e[1]=="last"){a-=7;}return f.set("date",f.getDate()+a);}}).alias("timeAgoInWords","timeDiffInWords");
Locale.define("en-US","Number",{decimal:".",group:",",currency:{prefix:"$ "}});Number.implement({format:function(q){var n=this;q=q?Object.clone(q):{};var a=function(i){if(q[i]!=null){return q[i];
}return Locale.get("Number."+i);};var f=n<0,h=a("decimal"),k=a("precision"),o=a("group"),c=a("decimals");if(f){var e=a("negative")||{};if(e.prefix==null&&e.suffix==null){e.prefix="-";
}["prefix","suffix"].each(function(i){if(e[i]){q[i]=a(i)+e[i];}});n=-n;}var l=a("prefix"),p=a("suffix");if(c!==""&&c>=0&&c<=20){n=n.toFixed(c);}if(k>=1&&k<=21){n=(+n).toPrecision(k);
}n+="";var m;if(a("scientific")===false&&n.indexOf("e")>-1){var j=n.split("e"),b=+j[1];n=j[0].replace(".","");if(b<0){b=-b-1;m=j[0].indexOf(".");if(m>-1){b-=m-1;
}while(b--){n="0"+n;}n="0."+n;}else{m=j[0].lastIndexOf(".");if(m>-1){b-=j[0].length-m-1;}while(b--){n+="0";}}}if(h!="."){n=n.replace(".",h);}if(o){m=n.lastIndexOf(h);
    m=(m>-1)?m:n.length;var d=n.substring(m),g=m;while(g--){if((m-g-1)%3==0&&g!=(m-1)){d=o+d;}d=n.charAt(g)+d;}n=d;}if(l){n=l+n;}if(p){n+=p;}return n;},formatCurrency:function(b){var a=Locale.get("Number.currency")||{};
    if(a.scientific==null){a.scientific=false;}a.decimals=b!=null?b:(a.decimals==null?2:a.decimals);return this.format(a);},formatPercentage:function(b){var a=Locale.get("Number.percentage")||{};
    if(a.suffix==null){a.suffix="%";}a.decimals=b!=null?b:(a.decimals==null?2:a.decimals);return this.format(a);}});(function(){var c={a:/[àáâãäåăą]/g,A:/[ÀÁÂÃÄÅĂĄ]/g,c:/[ćčç]/g,C:/[ĆČÇ]/g,d:/[ďđ]/g,D:/[ĎÐ]/g,e:/[èéêëěę]/g,E:/[ÈÉÊËĚĘ]/g,g:/[ğ]/g,G:/[Ğ]/g,i:/[ìíîï]/g,I:/[ÌÍÎÏ]/g,l:/[ĺľł]/g,L:/[ĹĽŁ]/g,n:/[ñňń]/g,N:/[ÑŇŃ]/g,o:/[òóôõöøő]/g,O:/[ÒÓÔÕÖØ]/g,r:/[řŕ]/g,R:/[ŘŔ]/g,s:/[ššş]/g,S:/[ŠŞŚ]/g,t:/[ťţ]/g,T:/[ŤŢ]/g,ue:/[ü]/g,UE:/[Ü]/g,u:/[ùúûůµ]/g,U:/[ÙÚÛŮ]/g,y:/[ÿý]/g,Y:/[ŸÝ]/g,z:/[žźż]/g,Z:/[ŽŹŻ]/g,th:/[þ]/g,TH:/[Þ]/g,dh:/[ð]/g,DH:/[Ð]/g,ss:/[ß]/g,oe:/[œ]/g,OE:/[Œ]/g,ae:/[æ]/g,AE:/[Æ]/g},b={" ":/[\xa0\u2002\u2003\u2009]/g,"*":/[\xb7]/g,"'":/[\u2018\u2019]/g,'"':/[\u201c\u201d]/g,"...":/[\u2026]/g,"-":/[\u2013]/g,"&raquo;":/[\uFFFD]/g};
    var a=function(f,h){var e=f,g;for(g in h){e=e.replace(h[g],g);}return e;};var d=function(e,g){e=e||"";var h=g?"<"+e+"(?!\\w)[^>]*>([\\s\\S]*?)</"+e+"(?!\\w)>":"</?"+e+"([^>]+)?>",f=new RegExp(h,"gi");
        return f;};String.implement({standardize:function(){return a(this,c);},repeat:function(e){return new Array(e+1).join(this);},pad:function(e,h,g){if(this.length>=e){return this;
    }var f=(h==null?" ":""+h).repeat(e-this.length).substr(0,e-this.length);if(!g||g=="right"){return this+f;}if(g=="left"){return f+this;}return f.substr(0,(f.length/2).floor())+this+f.substr(0,(f.length/2).ceil());
    },getTags:function(e,f){return this.match(d(e,f))||[];},stripTags:function(e,f){return this.replace(d(e,f),"");},tidy:function(){return a(this,b);},truncate:function(e,f,i){var h=this;
        if(f==null&&arguments.length==1){f="…";}if(h.length>e){h=h.substring(0,e);if(i){var g=h.lastIndexOf(i);if(g!=-1){h=h.substr(0,g);}}if(f){h+=f;}}return h;
    }});})();String.implement({parseQueryString:function(d,a){if(d==null){d=true;}if(a==null){a=true;}var c=this.split(/[&;]/),b={};if(!c.length){return b;
}c.each(function(i){var e=i.indexOf("=")+1,g=e?i.substr(e):"",f=e?i.substr(0,e-1).match(/([^\]\[]+|(\B)(?=\]))/g):[i],h=b;if(!f){return;}if(a){g=decodeURIComponent(g);
}f.each(function(k,j){if(d){k=decodeURIComponent(k);}var l=h[k];if(j<f.length-1){h=h[k]=l||{};}else{if(typeOf(l)=="array"){l.push(g);}else{h[k]=l!=null?[l,g]:g;
}}});});return b;},cleanQueryString:function(a){return this.split("&").filter(function(e){var b=e.indexOf("="),c=b<0?"":e.substr(0,b),d=e.substr(b+1);return a?a.call(null,c,d):(d||d===0);
}).join("&");}});(function(){var b=function(){return this.get("value");};var a=this.URI=new Class({Implements:Options,options:{},regex:/^(?:(\w+):)?(?:\/\/(?:(?:([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)?(\.\.?$|(?:[^?#\/]*\/)*)([^?#]*)(?:\?([^#]*))?(?:#(.*))?/,parts:["scheme","user","password","host","port","directory","file","query","fragment"],schemes:{http:80,https:443,ftp:21,rtsp:554,mms:1755,file:0},initialize:function(d,c){this.setOptions(c);
    var e=this.options.base||a.base;if(!d){d=e;}if(d&&d.parsed){this.parsed=Object.clone(d.parsed);}else{this.set("value",d.href||d.toString(),e?new a(e):false);
    }},parse:function(e,d){var c=e.match(this.regex);if(!c){return false;}c.shift();return this.merge(c.associate(this.parts),d);},merge:function(d,c){if((!d||!d.scheme)&&(!c||!c.scheme)){return false;
}if(c){this.parts.every(function(e){if(d[e]){return false;}d[e]=c[e]||"";return true;});}d.port=d.port||this.schemes[d.scheme.toLowerCase()];d.directory=d.directory?this.parseDirectory(d.directory,c?c.directory:""):"/";
    return d;},parseDirectory:function(d,e){d=(d.substr(0,1)=="/"?"":(e||"/"))+d;if(!d.test(a.regs.directoryDot)){return d;}var c=[];d.replace(a.regs.endSlash,"").split("/").each(function(f){if(f==".."&&c.length>0){c.pop();
}else{if(f!="."){c.push(f);}}});return c.join("/")+"/";},combine:function(c){return c.value||c.scheme+"://"+(c.user?c.user+(c.password?":"+c.password:"")+"@":"")+(c.host||"")+(c.port&&c.port!=this.schemes[c.scheme]?":"+c.port:"")+(c.directory||"/")+(c.file||"")+(c.query?"?"+c.query:"")+(c.fragment?"#"+c.fragment:"");
},set:function(d,f,e){if(d=="value"){var c=f.match(a.regs.scheme);if(c){c=c[1];}if(c&&this.schemes[c.toLowerCase()]==null){this.parsed={scheme:c,value:f};
}else{this.parsed=this.parse(f,(e||this).parsed)||(c?{scheme:c,value:f}:{value:f});}}else{if(d=="data"){this.setData(f);}else{this.parsed[d]=f;}}return this;
},get:function(c,d){switch(c){case"value":return this.combine(this.parsed,d?d.parsed:false);case"data":return this.getData();}return this.parsed[c]||"";
},go:function(){document.location.href=this.toString();},toURI:function(){return this;},getData:function(e,d){var c=this.get(d||"query");if(!(c||c===0)){return e?null:{};
}var f=c.parseQueryString();return e?f[e]:f;},setData:function(c,f,d){if(typeof c=="string"){var e=this.getData();e[arguments[0]]=arguments[1];c=e;}else{if(f){c=Object.merge(this.getData(),c);
}}return this.set(d||"query",Object.toQueryString(c));},clearData:function(c){return this.set(c||"query","");},toString:b,valueOf:b});a.regs={endSlash:/\/$/,scheme:/^(\w+):/,directoryDot:/\.\/|\.$/};
    a.base=new a(Array.from(document.getElements("base[href]",true)).getLast(),{base:document.location});String.implement({toURI:function(c){return new a(this,c);
    }});})();(function(){Events.Pseudos=function(h,e,f){var d="_monitorEvents:";var c=function(i){return{store:i.store?function(j,k){i.store(d+j,k);}:function(j,k){(i._monitorEvents||(i._monitorEvents={}))[j]=k;
},retrieve:i.retrieve?function(j,k){return i.retrieve(d+j,k);}:function(j,k){if(!i._monitorEvents){return k;}return i._monitorEvents[j]||k;}};};var g=function(k){if(k.indexOf(":")==-1||!h){return null;
}var j=Slick.parse(k).expressions[0][0],p=j.pseudos,i=p.length,o=[];while(i--){var n=p[i].key,m=h[n];if(m!=null){o.push({event:j.tag,value:p[i].value,pseudo:n,original:k,listener:m});
}}return o.length?o:null;};return{addEvent:function(m,p,j){var n=g(m);if(!n){return e.call(this,m,p,j);}var k=c(this),r=k.retrieve(m,[]),i=n[0].event,l=Array.slice(arguments,2),o=p,q=this;
    n.each(function(s){var t=s.listener,u=o;if(t==false){i+=":"+s.pseudo+"("+s.value+")";}else{o=function(){t.call(q,s,u,arguments,o);};}});r.include({type:i,event:p,monitor:o});
    k.store(m,r);if(m!=i){e.apply(this,[m,p].concat(l));}return e.apply(this,[i,o].concat(l));},removeEvent:function(m,l){var k=g(m);if(!k){return f.call(this,m,l);
}var n=c(this),j=n.retrieve(m);if(!j){return this;}var i=Array.slice(arguments,2);f.apply(this,[m,l].concat(i));j.each(function(o,p){if(!l||o.event==l){f.apply(this,[o.type,o.monitor].concat(i));
}delete j[p];},this);n.store(m,j);return this;}};};var b={once:function(e,f,d,c){f.apply(this,d);this.removeEvent(e.event,c).removeEvent(e.original,f);
},throttle:function(d,e,c){if(!e._throttled){e.apply(this,c);e._throttled=setTimeout(function(){e._throttled=false;},d.value||250);}},pause:function(d,e,c){clearTimeout(e._pause);
    e._pause=e.delay(d.value||250,this,c);}};Events.definePseudo=function(c,d){b[c]=d;return this;};Events.lookupPseudo=function(c){return b[c];};var a=Events.prototype;
    Events.implement(Events.Pseudos(b,a.addEvent,a.removeEvent));["Request","Fx"].each(function(c){if(this[c]){this[c].implement(Events.prototype);}});})();
(function(){var d={relay:false},c=["once","throttle","pause"],b=c.length;while(b--){d[c[b]]=Events.lookupPseudo(c[b]);}DOMEvent.definePseudo=function(e,f){d[e]=f;
    return this;};var a=Element.prototype;[Element,Window,Document].invoke("implement",Events.Pseudos(d,a.addEvent,a.removeEvent));})();(function(){var b=function(e,d){var f=[];
    Object.each(d,function(g){Object.each(g,function(h){e.each(function(i){f.push(i+"-"+h+(i=="border"?"-width":""));});});});return f;};var c=function(f,e){var d=0;
    Object.each(e,function(h,g){if(g.test(f)){d=d+h.toInt();}});return d;};var a=function(d){return !!(!d||d.offsetHeight||d.offsetWidth);};Element.implement({measure:function(h){if(a(this)){return h.call(this);
}var g=this.getParent(),e=[];while(!a(g)&&g!=document.body){e.push(g.expose());g=g.getParent();}var f=this.expose(),d=h.call(this);f();e.each(function(i){i();
});return d;},expose:function(){if(this.getStyle("display")!="none"){return function(){};}var d=this.style.cssText;this.setStyles({display:"block",position:"absolute",visibility:"hidden"});
    return function(){this.style.cssText=d;}.bind(this);},getDimensions:function(d){d=Object.merge({computeSize:false},d);var i={x:0,y:0};var h=function(j,e){return(e.computeSize)?j.getComputedSize(e):j.getSize();
};var f=this.getParent("body");if(f&&this.getStyle("display")=="none"){i=this.measure(function(){return h(this,d);});}else{if(f){try{i=h(this,d);}catch(g){}}}return Object.append(i,(i.x||i.x===0)?{width:i.x,height:i.y}:{x:i.width,y:i.height});
},getComputedSize:function(d){d=Object.merge({styles:["padding","border"],planes:{height:["top","bottom"],width:["left","right"]},mode:"both"},d);var g={},e={width:0,height:0},f;
    if(d.mode=="vertical"){delete e.width;delete d.planes.width;}else{if(d.mode=="horizontal"){delete e.height;delete d.planes.height;}}b(d.styles,d.planes).each(function(h){g[h]=this.getStyle(h).toInt();
    },this);Object.each(d.planes,function(i,h){var k=h.capitalize(),j=this.getStyle(h);if(j=="auto"&&!f){f=this.getDimensions();}j=g[h]=(j=="auto")?f[h]:j.toInt();
        e["total"+k]=j;i.each(function(m){var l=c(m,g);e["computed"+m.capitalize()]=l;e["total"+k]+=l;});},this);return Object.append(e,g);}});})();Element.implement({isDisplayed:function(){return this.getStyle("display")!="none";
},isVisible:function(){var a=this.offsetWidth,b=this.offsetHeight;return(a==0&&b==0)?false:(a>0&&b>0)?true:this.style.display!="none";},toggle:function(){return this[this.isDisplayed()?"hide":"show"]();
},hide:function(){var b;try{b=this.getStyle("display");}catch(a){}if(b=="none"){return this;}return this.store("element:_originalDisplay",b||"").setStyle("display","none");
},show:function(a){if(!a&&this.isDisplayed()){return this;}a=a||this.retrieve("element:_originalDisplay")||"block";return this.setStyle("display",(a=="none")?"block":a);
},swapClass:function(a,b){return this.removeClass(a).addClass(b);}});Document.implement({clearSelection:function(){if(window.getSelection){var a=window.getSelection();
    if(a&&a.removeAllRanges){a.removeAllRanges();}}else{if(document.selection&&document.selection.empty){try{document.selection.empty();}catch(b){}}}}});var Asset={javascript:function(d,b){if(!b){b={};
}var a=new Element("script",{src:d,type:"text/javascript"}),e=b.document||document,c=b.onload||b.onLoad;delete b.onload;delete b.onLoad;delete b.document;
    if(c){if(typeof a.onreadystatechange!="undefined"){a.addEvent("readystatechange",function(){if(["loaded","complete"].contains(this.readyState)){c.call(this);
    }});}else{a.addEvent("load",c);}}return a.set(b).inject(e.head);},css:function(d,a){if(!a){a={};}var b=new Element("link",{rel:"stylesheet",media:"screen",type:"text/css",href:d});
    var c=a.onload||a.onLoad,e=a.document||document;delete a.onload;delete a.onLoad;delete a.document;if(c){b.addEvent("load",c);}return b.set(a).inject(e.head);
},image:function(c,b){if(!b){b={};}var d=new Image(),a=document.id(d)||new Element("img");["load","abort","error"].each(function(e){var g="on"+e,f="on"+e.capitalize(),h=b[g]||b[f]||function(){};
    delete b[f];delete b[g];d[g]=function(){if(!d){return;}if(!a.parentNode){a.width=d.width;a.height=d.height;}d=d.onload=d.onabort=d.onerror=null;h.delay(1,a,a);
        a.fireEvent(e,a,1);};});d.src=a.src=c;if(d&&d.complete){d.onload.delay(1);}return a.set(b);},images:function(c,b){c=Array.from(c);var d=function(){},a=0;
    b=Object.merge({onComplete:d,onProgress:d,onError:d,properties:{}},b);return new Elements(c.map(function(f,e){return Asset.image(f,Object.append(b.properties,{onload:function(){a++;
        b.onProgress.call(this,a,e,f);if(a==c.length){b.onComplete();}},onerror:function(){a++;b.onError.call(this,a,e,f);if(a==c.length){b.onComplete();}}}));
    }));}};

Fx.Elements=new Class({Extends:Fx.CSS,initialize:function(b,a){this.elements=this.subject=$$(b);this.parent(a)},compute:function(g,h,j){var c={};for(var d in g){var a=g[d],e=h[d],f=c[d]={};for(var b in a){f[b]=this.parent(a[b],e[b],j)}}return c},set:function(b){for(var c in b){if(!this.elements[c]){continue}var a=b[c];for(var d in a){this.render(this.elements[c],d,a[d],this.options.unit)}}return this},start:function(c){if(!this.check(c)){return this}var h={},j={};for(var d in c){if(!this.elements[d]){continue}var f=c[d],a=h[d]={},g=j[d]={};for(var b in f){var e=this.prepare(this.elements[d],b,f[b]);a[b]=e.from;g[b]=e.to}}return this.parent(h,j)}});Fx.Accordion=new Class({Extends:Fx.Elements,options:{fixedHeight:false,fixedWidth:false,display:0,show:false,height:true,width:false,opacity:true,alwaysHide:false,trigger:"click",initialDisplayFx:true,resetHeight:true},initialize:function(){var g=function(h){return h!=null};var f=Array.link(arguments,{container:Type.isElement,options:Type.isObject,togglers:g,elements:g});this.parent(f.elements,f.options);var b=this.options,e=this.togglers=$$(f.togglers);this.previous=-1;this.internalChain=new Chain();if(b.alwaysHide){this.options.link="chain"}if(b.show||this.options.show===0){b.display=false;this.previous=b.show}if(b.start){b.display=false;b.show=false}var d=this.effects={};if(b.opacity){d.opacity="fullOpacity"}if(b.width){d.width=b.fixedWidth?"fullWidth":"offsetWidth"}if(b.height){d.height=b.fixedHeight?"fullHeight":"scrollHeight"}for(var c=0,a=e.length;c<a;c++){this.addSection(e[c],this.elements[c])}this.elements.each(function(j,h){if(b.show===h){this.fireEvent("active",[e[h],j])}else{for(var k in d){j.setStyle(k,0)}}},this);if(b.display||b.display===0||b.initialDisplayFx===false){this.display(b.display,b.initialDisplayFx)}if(b.fixedHeight!==false){b.resetHeight=false}this.addEvent("complete",this.internalChain.callChain.bind(this.internalChain))},addSection:function(g,d){g=document.id(g);d=document.id(d);this.togglers.include(g);this.elements.include(d);var f=this.togglers,c=this.options,h=f.contains(g),a=f.indexOf(g),b=this.display.pass(a,this);g.store("accordion:display",b).addEvent(c.trigger,b);if(c.height){d.setStyles({"padding-top":0,"border-top":"none","padding-bottom":0,"border-bottom":"none"})}if(c.width){d.setStyles({"padding-left":0,"border-left":"none","padding-right":0,"border-right":"none"})}d.fullOpacity=1;if(c.fixedWidth){d.fullWidth=c.fixedWidth}if(c.fixedHeight){d.fullHeight=c.fixedHeight}d.setStyle("overflow","hidden");if(!h){for(var e in this.effects){d.setStyle(e,0)}}return this},removeSection:function(f,b){var e=this.togglers,a=e.indexOf(f),c=this.elements[a];var d=function(){e.erase(f);this.elements.erase(c);this.detach(f)}.bind(this);if(this.now==a||b!=null){this.display(b!=null?b:(a-1>=0?a-1:0)).chain(d)}else{d()}return this},detach:function(b){var a=function(c){c.removeEvent(this.options.trigger,c.retrieve("accordion:display"))}.bind(this);if(!b){this.togglers.each(a)}else{a(b)}return this},display:function(b,c){if(!this.check(b,c)){return this}var h={},g=this.elements,a=this.options,f=this.effects;if(c==null){c=true}if(typeOf(b)=="element"){b=g.indexOf(b)}if(b==this.previous&&!a.alwaysHide){return this}if(a.resetHeight){var e=g[this.previous];if(e&&!this.selfHidden){for(var d in f){e.setStyle(d,e[f[d]])}}}if((this.timer&&a.link=="chain")||(b===this.previous&&!a.alwaysHide)){return this}this.previous=b;this.selfHidden=false;g.each(function(l,k){h[k]={};var j;if(k!=b){j=true}else{if(a.alwaysHide&&((l.offsetHeight>0&&a.height)||l.offsetWidth>0&&a.width)){j=true;this.selfHidden=true}}this.fireEvent(j?"background":"active",[this.togglers[k],l]);for(var m in f){h[k][m]=j?0:l[f[m]]}if(!c&&!j&&a.resetHeight){h[k].height="auto"}},this);this.internalChain.clearChain();this.internalChain.chain(function(){if(a.resetHeight&&!this.selfHidden){var i=g[b];if(i){i.setStyle("height","auto")}}}.bind(this));return c?this.start(h):this.set(h).internalChain.callChain()}});var Accordion=new Class({Extends:Fx.Accordion,initialize:function(){this.parent.apply(this,arguments);var a=Array.link(arguments,{container:Type.isElement});this.container=a.container},addSection:function(c,b,e){c=document.id(c);b=document.id(b);var d=this.togglers.contains(c);var a=this.togglers.length;if(a&&(!d||e)){e=e!=null?e:a-1;c.inject(this.togglers[e],"before");b.inject(c,"after")}else{if(this.container&&!d){c.inject(this.container);b.inject(this.container)}}return this.parent.apply(this,arguments)}});(function(){Fx.Scroll=new Class({Extends:Fx,options:{offset:{x:0,y:0},wheelStops:true},initialize:function(c,b){this.element=this.subject=document.id(c);this.parent(b);if(typeOf(this.element)!="element"){this.element=document.id(this.element.getDocument().body)}if(this.options.wheelStops){var d=this.element,e=this.cancel.pass(false,this);this.addEvent("start",function(){d.addEvent("mousewheel",e)},true);this.addEvent("complete",function(){d.removeEvent("mousewheel",e)},true)}},set:function(){var b=Array.flatten(arguments);if(Browser.firefox){b=[Math.round(b[0]),Math.round(b[1])]}this.element.scrollTo(b[0],b[1]);return this},compute:function(d,c,b){return[0,1].map(function(e){return Fx.compute(d[e],c[e],b)})},start:function(c,d){if(!this.check(c,d)){return this}var b=this.element.getScroll();return this.parent([b.x,b.y],[c,d])},calculateScroll:function(g,f){var d=this.element,b=d.getScrollSize(),h=d.getScroll(),j=d.getSize(),c=this.options.offset,i={x:g,y:f};for(var e in i){if(!i[e]&&i[e]!==0){i[e]=h[e]}if(typeOf(i[e])!="number"){i[e]=b[e]-j[e]}i[e]+=c[e]}return[i.x,i.y]},toTop:function(){return this.start.apply(this,this.calculateScroll(false,0))},toLeft:function(){return this.start.apply(this,this.calculateScroll(0,false))},toRight:function(){return this.start.apply(this,this.calculateScroll("right",false))},toBottom:function(){return this.start.apply(this,this.calculateScroll(false,"bottom"))},toElement:function(d,e){e=e?Array.from(e):["x","y"];var c=a(this.element)?{x:0,y:0}:this.element.getScroll();var b=Object.map(document.id(d).getPosition(this.element),function(g,f){return e.contains(f)?g+c[f]:false});return this.start.apply(this,this.calculateScroll(b.x,b.y))},toElementEdge:function(d,g,e){g=g?Array.from(g):["x","y"];d=document.id(d);var i={},f=d.getPosition(this.element),j=d.getSize(),h=this.element.getScroll(),b=this.element.getSize(),c={x:f.x+j.x,y:f.y+j.y};["x","y"].each(function(k){if(g.contains(k)){if(c[k]>h[k]+b[k]){i[k]=c[k]-b[k]}if(f[k]<h[k]){i[k]=f[k]}}if(i[k]==null){i[k]=h[k]}if(e&&e[k]){i[k]=i[k]+e[k]}},this);if(i.x!=h.x||i.y!=h.y){this.start(i.x,i.y)}return this},toElementCenter:function(e,f,h){f=f?Array.from(f):["x","y"];e=document.id(e);var i={},c=e.getPosition(this.element),d=e.getSize(),b=this.element.getScroll(),g=this.element.getSize();["x","y"].each(function(j){if(f.contains(j)){i[j]=c[j]-(g[j]-d[j])/2}if(i[j]==null){i[j]=b[j]}if(h&&h[j]){i[j]=i[j]+h[j]}},this);if(i.x!=b.x||i.y!=b.y){this.start(i.x,i.y)}return this}});Fx.Scroll.implement({scrollToCenter:function(){return this.toElementCenter.apply(this,arguments)},scrollIntoView:function(){return this.toElementEdge.apply(this,arguments)}});function a(b){return(/^(?:body|html)$/i).test(b.tagName)}})();Fx.Slide=new Class({Extends:Fx,options:{mode:"vertical",wrapper:false,hideOverflow:true,resetHeight:false},initialize:function(b,a){b=this.element=this.subject=document.id(b);this.parent(a);a=this.options;var d=b.retrieve("wrapper"),c=b.getStyles("margin","position","overflow");if(a.hideOverflow){c=Object.append(c,{overflow:"hidden"})}if(a.wrapper){d=document.id(a.wrapper).setStyles(c)}if(!d){d=new Element("div",{styles:c}).wraps(b)}b.store("wrapper",d).setStyle("margin",0);if(b.getStyle("overflow")=="visible"){b.setStyle("overflow","hidden")}this.now=[];this.open=true;this.wrapper=d;this.addEvent("complete",function(){this.open=(d["offset"+this.layout.capitalize()]!=0);if(this.open&&this.options.resetHeight){d.setStyle("height","")}},true)},vertical:function(){this.margin="margin-top";this.layout="height";this.offset=this.element.offsetHeight},horizontal:function(){this.margin="margin-left";this.layout="width";this.offset=this.element.offsetWidth},set:function(a){this.element.setStyle(this.margin,a[0]);this.wrapper.setStyle(this.layout,a[1]);return this},compute:function(c,b,a){return[0,1].map(function(d){return Fx.compute(c[d],b[d],a)})},start:function(b,e){if(!this.check(b,e)){return this}this[e||this.options.mode]();var d=this.element.getStyle(this.margin).toInt(),c=this.wrapper.getStyle(this.layout).toInt(),a=[[d,c],[0,this.offset]],g=[[d,c],[-this.offset,0]],f;switch(b){case"in":f=a;break;case"out":f=g;break;case"toggle":f=(c==0)?a:g}return this.parent(f[0],f[1])},slideIn:function(a){return this.start("in",a)},slideOut:function(a){return this.start("out",a)},hide:function(a){this[a||this.options.mode]();this.open=false;return this.set([-this.offset,0])},show:function(a){this[a||this.options.mode]();this.open=true;return this.set([0,this.offset])},toggle:function(a){return this.start("toggle",a)}});Element.Properties.slide={set:function(a){this.get("slide").cancel().setOptions(a);return this},get:function(){var a=this.retrieve("slide");if(!a){a=new Fx.Slide(this,{link:"cancel"});this.store("slide",a)}return a}};Element.implement({slide:function(d,e){d=d||"toggle";var b=this.get("slide"),a;switch(d){case"hide":b.hide(e);break;case"show":b.show(e);break;case"toggle":var c=this.retrieve("slide:flag",b.open);b[c?"slideOut":"slideIn"](e);this.store("slide:flag",!c);a=true;break;default:b.start(d,e)}if(!a){this.eliminate("slide:flag")}return this}});var Drag=new Class({Implements:[Events,Options],options:{snap:6,unit:"px",grid:false,style:true,limit:false,handle:false,invert:false,preventDefault:false,stopPropagation:false,modifiers:{x:"left",y:"top"}},initialize:function(){var b=Array.link(arguments,{options:Type.isObject,element:function(c){return c!=null}});this.element=document.id(b.element);this.document=this.element.getDocument();this.setOptions(b.options||{});var a=typeOf(this.options.handle);this.handles=((a=="array"||a=="collection")?$$(this.options.handle):document.id(this.options.handle))||this.element;this.mouse={now:{},pos:{}};this.value={start:{},now:{}};this.selection=(Browser.ie)?"selectstart":"mousedown";if(Browser.ie&&!Drag.ondragstartFixed){document.ondragstart=Function.from(false);Drag.ondragstartFixed=true}this.bound={start:this.start.bind(this),check:this.check.bind(this),drag:this.drag.bind(this),stop:this.stop.bind(this),cancel:this.cancel.bind(this),eventStop:Function.from(false)};this.attach()},attach:function(){this.handles.addEvent("mousedown",this.bound.start);return this},detach:function(){this.handles.removeEvent("mousedown",this.bound.start);return this},start:function(a){var j=this.options;if(a.rightClick){return}if(j.preventDefault){a.preventDefault()}if(j.stopPropagation){a.stopPropagation()}this.mouse.start=a.page;this.fireEvent("beforeStart",this.element);var c=j.limit;this.limit={x:[],y:[]};var e,g;for(e in j.modifiers){if(!j.modifiers[e]){continue}var b=this.element.getStyle(j.modifiers[e]);if(b&&!b.match(/px$/)){if(!g){g=this.element.getCoordinates(this.element.getOffsetParent())}b=g[j.modifiers[e]]}if(j.style){this.value.now[e]=(b||0).toInt()}else{this.value.now[e]=this.element[j.modifiers[e]]}if(j.invert){this.value.now[e]*=-1}this.mouse.pos[e]=a.page[e]-this.value.now[e];if(c&&c[e]){var d=2;while(d--){var f=c[e][d];if(f||f===0){this.limit[e][d]=(typeof f=="function")?f():f}}}}if(typeOf(this.options.grid)=="number"){this.options.grid={x:this.options.grid,y:this.options.grid}}var h={mousemove:this.bound.check,mouseup:this.bound.cancel};h[this.selection]=this.bound.eventStop;this.document.addEvents(h)},check:function(a){if(this.options.preventDefault){a.preventDefault()}var b=Math.round(Math.sqrt(Math.pow(a.page.x-this.mouse.start.x,2)+Math.pow(a.page.y-this.mouse.start.y,2)));if(b>this.options.snap){this.cancel();this.document.addEvents({mousemove:this.bound.drag,mouseup:this.bound.stop});this.fireEvent("start",[this.element,a]).fireEvent("snap",this.element)}},drag:function(b){var a=this.options;if(a.preventDefault){b.preventDefault()}this.mouse.now=b.page;for(var c in a.modifiers){if(!a.modifiers[c]){continue}this.value.now[c]=this.mouse.now[c]-this.mouse.pos[c];if(a.invert){this.value.now[c]*=-1}if(a.limit&&this.limit[c]){if((this.limit[c][1]||this.limit[c][1]===0)&&(this.value.now[c]>this.limit[c][1])){this.value.now[c]=this.limit[c][1]}else{if((this.limit[c][0]||this.limit[c][0]===0)&&(this.value.now[c]<this.limit[c][0])){this.value.now[c]=this.limit[c][0]}}}if(a.grid[c]){this.value.now[c]-=((this.value.now[c]-(this.limit[c][0]||0))%a.grid[c])}if(a.style){this.element.setStyle(a.modifiers[c],this.value.now[c]+a.unit)}else{this.element[a.modifiers[c]]=this.value.now[c]}}this.fireEvent("drag",[this.element,b])},cancel:function(a){this.document.removeEvents({mousemove:this.bound.check,mouseup:this.bound.cancel});if(a){this.document.removeEvent(this.selection,this.bound.eventStop);this.fireEvent("cancel",this.element)}},stop:function(b){var a={mousemove:this.bound.drag,mouseup:this.bound.stop};a[this.selection]=this.bound.eventStop;this.document.removeEvents(a);if(b){this.fireEvent("complete",[this.element,b])}}});Element.implement({makeResizable:function(a){var b=new Drag(this,Object.merge({modifiers:{x:"width",y:"height"}},a));this.store("resizer",b);return b.addEvent("drag",function(){this.fireEvent("resize",b)}.bind(this))}});Drag.Move=new Class({Extends:Drag,options:{droppables:[],container:false,precalculate:false,includeMargins:true,checkDroppables:true},initialize:function(b,a){this.parent(b,a);b=this.element;this.droppables=$$(this.options.droppables);this.container=document.id(this.options.container);if(this.container&&typeOf(this.container)!="element"){this.container=document.id(this.container.getDocument().body)}if(this.options.style){if(this.options.modifiers.x=="left"&&this.options.modifiers.y=="top"){var c=b.getOffsetParent(),d=b.getStyles("left","top");if(c&&(d.left=="auto"||d.top=="auto")){b.setPosition(b.getPosition(c))}}if(b.getStyle("position")=="static"){b.setStyle("position","absolute")}}this.addEvent("start",this.checkDroppables,true);this.overed=null},start:function(a){if(this.container){this.options.limit=this.calculateLimit()}if(this.options.precalculate){this.positions=this.droppables.map(function(b){return b.getCoordinates()})}this.parent(a)},calculateLimit:function(){var j=this.element,e=this.container,d=document.id(j.getOffsetParent())||document.body,h=e.getCoordinates(d),c={},b={},k={},g={},m={};["top","right","bottom","left"].each(function(q){c[q]=j.getStyle("margin-"+q).toInt();b[q]=j.getStyle("border-"+q).toInt();k[q]=e.getStyle("margin-"+q).toInt();g[q]=e.getStyle("border-"+q).toInt();m[q]=d.getStyle("padding-"+q).toInt()},this);var f=j.offsetWidth+c.left+c.right,p=j.offsetHeight+c.top+c.bottom,i=0,l=0,o=h.right-g.right-f,a=h.bottom-g.bottom-p;if(this.options.includeMargins){i+=c.left;l+=c.top}else{o+=c.right;a+=c.bottom}if(j.getStyle("position")=="relative"){var n=j.getCoordinates(d);n.left-=j.getStyle("left").toInt();n.top-=j.getStyle("top").toInt();i-=n.left;l-=n.top;if(e.getStyle("position")!="relative"){i+=g.left;l+=g.top}o+=c.left-n.left;a+=c.top-n.top;if(e!=d){i+=k.left+m.left;l+=((Browser.ie6||Browser.ie7)?0:k.top)+m.top}}else{i-=c.left;l-=c.top;if(e!=d){i+=h.left+g.left;l+=h.top+g.top}}return{x:[i,o],y:[l,a]}},getDroppableCoordinates:function(c){var b=c.getCoordinates();if(c.getStyle("position")=="fixed"){var a=window.getScroll();b.left+=a.x;b.right+=a.x;b.top+=a.y;b.bottom+=a.y}return b},checkDroppables:function(){var a=this.droppables.filter(function(d,c){d=this.positions?this.positions[c]:this.getDroppableCoordinates(d);var b=this.mouse.now;return(b.x>d.left&&b.x<d.right&&b.y<d.bottom&&b.y>d.top)},this).getLast();if(this.overed!=a){if(this.overed){this.fireEvent("leave",[this.element,this.overed])}if(a){this.fireEvent("enter",[this.element,a])}this.overed=a}},drag:function(a){this.parent(a);if(this.options.checkDroppables&&this.droppables.length){this.checkDroppables()}},stop:function(a){this.checkDroppables();this.fireEvent("drop",[this.element,this.overed,a]);this.overed=null;return this.parent(a)}});Element.implement({makeDraggable:function(a){var b=new Drag.Move(this,a);this.store("dragger",b);return b}});(function(){var a=function(d){var b=d.options.hideInputs;if(window.OverText){var c=[null];OverText.each(function(e){c.include("."+e.options.labelClass)});if(c){b+=c.join(", ")}}return(b)?d.element.getElements(b):null};Fx.Reveal=new Class({Extends:Fx.Morph,options:{link:"cancel",styles:["padding","border","margin"],transitionOpacity:!Browser.ie6,mode:"vertical",display:function(){return this.element.get("tag")!="tr"?"block":"table-row"},opacity:1,hideInputs:Browser.ie?"select, input, textarea, object, embed":null},dissolve:function(){if(!this.hiding&&!this.showing){if(this.element.getStyle("display")!="none"){this.hiding=true;this.showing=false;this.hidden=true;this.cssText=this.element.style.cssText;var d=this.element.getComputedSize({styles:this.options.styles,mode:this.options.mode});if(this.options.transitionOpacity){d.opacity=this.options.opacity}var c={};Object.each(d,function(f,e){c[e]=[f,0]});this.element.setStyles({display:Function.from(this.options.display).call(this),overflow:"hidden"});var b=a(this);if(b){b.setStyle("visibility","hidden")}this.$chain.unshift(function(){if(this.hidden){this.hiding=false;this.element.style.cssText=this.cssText;this.element.setStyle("display","none");if(b){b.setStyle("visibility","visible")}}this.fireEvent("hide",this.element);this.callChain()}.bind(this));this.start(c)}else{this.callChain.delay(10,this);this.fireEvent("complete",this.element);this.fireEvent("hide",this.element)}}else{if(this.options.link=="chain"){this.chain(this.dissolve.bind(this))}else{if(this.options.link=="cancel"&&!this.hiding){this.cancel();this.dissolve()}}}return this},reveal:function(){if(!this.showing&&!this.hiding){if(this.element.getStyle("display")=="none"){this.hiding=false;this.showing=true;this.hidden=false;this.cssText=this.element.style.cssText;var d;this.element.measure(function(){d=this.element.getComputedSize({styles:this.options.styles,mode:this.options.mode})}.bind(this));if(this.options.heightOverride!=null){d.height=this.options.heightOverride.toInt()}if(this.options.widthOverride!=null){d.width=this.options.widthOverride.toInt()}if(this.options.transitionOpacity){this.element.setStyle("opacity",0);d.opacity=this.options.opacity}var c={height:0,display:Function.from(this.options.display).call(this)};Object.each(d,function(f,e){c[e]=0});c.overflow="hidden";this.element.setStyles(c);var b=a(this);if(b){b.setStyle("visibility","hidden")}this.$chain.unshift(function(){this.element.style.cssText=this.cssText;this.element.setStyle("display",Function.from(this.options.display).call(this));if(!this.hidden){this.showing=false}if(b){b.setStyle("visibility","visible")}this.callChain();this.fireEvent("show",this.element)}.bind(this));this.start(d)}else{this.callChain();this.fireEvent("complete",this.element);this.fireEvent("show",this.element)}}else{if(this.options.link=="chain"){this.chain(this.reveal.bind(this))}else{if(this.options.link=="cancel"&&!this.showing){this.cancel();this.reveal()}}}return this},toggle:function(){if(this.element.getStyle("display")=="none"){this.reveal()}else{this.dissolve()}return this},cancel:function(){this.parent.apply(this,arguments);if(this.cssText!=null){this.element.style.cssText=this.cssText}this.hiding=false;this.showing=false;return this}});Element.Properties.reveal={set:function(b){this.get("reveal").cancel().setOptions(b);return this},get:function(){var b=this.retrieve("reveal");if(!b){b=new Fx.Reveal(this);this.store("reveal",b)}return b}};Element.Properties.dissolve=Element.Properties.reveal;Element.implement({reveal:function(b){this.get("reveal").setOptions(b).reveal();return this},dissolve:function(b){this.get("reveal").setOptions(b).dissolve();return this},nix:function(b){var c=Array.link(arguments,{destroy:Type.isBoolean,options:Type.isObject});this.get("reveal").setOptions(b).dissolve().chain(function(){this[c.destroy?"destroy":"dispose"]()}.bind(this));return this},wink:function(){var c=Array.link(arguments,{duration:Type.isNumber,options:Type.isObject});var b=this.get("reveal").setOptions(c.options);b.reveal().chain(function(){(function(){b.dissolve()}).delay(c.duration||2000)})}})})();Fx.Move=new Class({Extends:Fx.Morph,options:{relativeTo:document.body,position:"center",edge:false,offset:{x:0,y:0}},start:function(a){var b=this.element,c=b.getStyles("top","left");if(c.top=="auto"||c.left=="auto"){b.setPosition(b.getPosition(b.getOffsetParent()))}return this.parent(b.position(Object.merge({},this.options,a,{returnPos:true})))}});Element.Properties.move={set:function(a){this.get("move").cancel().setOptions(a);return this},get:function(){var a=this.retrieve("move");if(!a){a=new Fx.Move(this,{link:"cancel"});this.store("move",a)}return a}};Element.implement({move:function(a){this.get("move").start(a);return this}});

EOL.namespace('belowFold');

/**
 * If set to true, the belowCallback will be triggered offset px from the top of the page.
 * If set to false, the belowCallback will be triggered offset px + viewport height from the top of
 * the page.
 */
EOL.belowFold.checkOffsetOnly = false;

EOL.belowFold.isBelow = false;

EOL.belowFold.offset = 0;

EOL.belowFold.belowCallback = function(){}
EOL.belowFold.aboveCallback = function(){}

/**
 *
 * @param offset integer offset of number of pixels to wait for until below the fold.
 * @param belowCallback is the callback function executed when
 */
EOL.belowFold.init = function(offset, checkOffsetOnly, belowCallback, aboveCallback){
	EOL.belowFold.offset = offset;
	EOL.belowFold.checkOffsetOnly = checkOffsetOnly;
	EOL.belowFold.belowCallback = belowCallback;
	EOL.belowFold.aboveCallback = aboveCallback;
    window.addEvent('scroll', EOL.belowFold.callback);
}

EOL.belowFold.isBelowFold = function(){
	scrollTop = EOL.belowFold.getScrollTop();
	height = document.documentElement.clientHeight

	if (EOL.belowFold.checkOffsetOnly){
		return EOL.belowFold.offset < scrollTop;
	} else {
    	return (height + EOL.belowFold.offset) < scrollTop;
	}
}

EOL.belowFold.callback = function(){

	wasBelowFold = EOL.belowFold.isBelow;
	EOL.belowFold.isBelow = EOL.belowFold.isBelowFold();

	if (wasBelowFold && !EOL.belowFold.isBelow){
		EOL.belowFold.aboveCallback();
	} else if (!wasBelowFold && EOL.belowFold.isBelow) {
		//console.log('was not below fold and is now');
		EOL.belowFold.belowCallback();
	}
}

EOL.belowFold.getScrollTop = function() {
    if(typeof pageYOffset!= 'undefined'){
        //most browsers
        return pageYOffset;
    }
    else{
        var B= document.body; //IE 'quirks'
        var D= document.documentElement; //IE with doctype
        D= (D.clientHeight)? D: B;
        return D.scrollTop;
    }
}
