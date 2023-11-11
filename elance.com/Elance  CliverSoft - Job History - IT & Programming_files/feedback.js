

  (function() {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
  })();


EOL.namespace('jobHistory');

EOL.jobHistory.initiated = false;
EOL.jobHistory.cacheEnabled = false;
EOL.jobHistory.userid;
EOL.jobHistory.catid;
EOL.jobHistory.filterTime = '';
EOL.jobHistory.sixmonthLimit = 0;
EOL.jobHistory.filterCategory = '';
EOL.jobHistory.filterSubCategory = '';
EOL.jobHistory.filterRating = '';
EOL.jobHistory.filterRatingLow = 0;
EOL.jobHistory.filterRatingUp = 5;
EOL.jobHistory.filterStatus = '';
EOL.jobHistory.filterSearch = '';
EOL.jobHistory.sort = '';
EOL.jobHistory.sortOrder = '';
EOL.jobHistory.keywordSearch = '';
EOL.jobHistory.keywordSearchOn = false;
EOL.jobHistory.keywordCount = 0;
EOL.jobHistory.numJobDisplayed = 0;
EOL.jobHistory.numJobAvailable = 0;
EOL.jobHistory.numJobTotal = 0;
EOL.jobHistory.hasAllJobs = false;
EOL.jobHistory.jobList = new Array();

function Job(id, order){
    function display(setting){
        this.display = setting;
    }

    function getJobid(){
        return this.id;
    }

    this.id = id;
    this.order = order;
    this.display = true;
    this.tdate = null;
    this.category = null;
    this.ratings = null;
    this.keyword = null;
}

EOL.jobHistory.getFilterNSort = function(){
    var filter = '';
    if(EOL.jobHistory.filterCategory){
        filter += '&c='+EOL.jobHistory.filterCategory
    }
    if(EOL.jobHistory.filterSubCategory){
                if(EOL.jobHistory.filterCategory){
            filter += '&sc='+EOL.jobHistory.filterSubCategory;
        } else {
            filter += '&c='+EOL.jobHistory.filterSubCategory;
        }
       }
    if(EOL.jobHistory.filterTime ){
        filter += '&t=1'
    }
    if(EOL.jobHistory.filterRating) {
        filter += '&r='+EOL.jobHistory.filterRating;
    }
    if(EOL.jobHistory.filterSearchOn && $('pastjob_search').value){
        filter += '&k='+escape($('pastjob_search').value);
    }
    if(EOL.jobHistory.sort){
        filter += '&s='+EOL.jobHistory.sort;
        filter += '&o='+EOL.jobHistory.sortOrder;
    }
		if (EOL.jobHistory.filterStatus) {
			filter += '&st='+EOL.jobHistory.filterStatus;
		}
    EOL.jobHistory.hasEveryJobs();
    return filter;
}

EOL.jobHistory.hideSubcategory = function(catid) {
    if(catid) {
        $('subcat_filter').href = "javascript:EOL.jobHistory.showMenu('filterSubCategory')";
    }
    var catids = new Array(10178,10179,10180,10183,10184,10186,10187,14000);
    for(i=0;i<catids.length;i++){
        if($('cat_id_'+catids[i])) $('cat_id_'+catids[i]).addClass('displayNone');
    }
    if($('cat_id_'+catid)) $('cat_id_'+catid).removeClass('displayNone');

}

EOL.jobHistory.setFilter = function(type, settings){
    EOL.jobHistory.hideAllMenu();
    switch(type) {
        case 'category':
            EOL.jobHistory.filterCategory = settings;
            if($('subcat_filter') && $('cat_id_'+settings)){
                EOL.jobHistory.hideSubcategory(settings);
            }
            break;
         case 'subcategory':
                        EOL.jobHistory.filterSubCategory = settings;
            break;
        case 'time':
            if(settings != ''){
                EOL.jobHistory.filterTime = '';
            } else {
                 EOL.jobHistory.filterTime = 1;
            }
            EOL.jobHistory.hideMenu('filterTime');
            EOL.jobHistory.redirectToPage();
            break;
        case 'rating':
            EOL.jobHistory.filterRating = settings;
             switch(EOL.jobHistory.filterRating){
                    case 'pos':
                        EOL.jobHistory.filterRatingLow = 4;
                EOL.jobHistory.filterRatingUp = 5;
            break;
                    case 'neu':
                EOL.jobHistory.filterRatingLow = 3;
                                EOL.jobHistory.filterRatingUp = 4;
            break;
                    case 'neg':
                        EOL.jobHistory.filterRatingLow = 0;
                                EOL.jobHistory.filterRatingUp = 3;
            break;
                }

            break;
				case 'status':
					EOL.jobHistory.filterStatus = settings;
				break;
    }
}

EOL.jobHistory.filterShown = function(id, menu, name){
    $(id).innerHTML = name;
    $(id).title = name;
    EOL.jobHistory.hideMenu(menu);
    if($('subcat_filter')){
        if(name == 'All Categories'){
            $('subcat_filter').href = "";
        }
    }
    if(id == 'cat_filter' && name == 'All Categories') {
        $('subcat_filter').style.display = 'none';
    }

}

EOL.jobHistory.setSort = function(type, order){
    EOL.jobHistory.hideAllMenu();
//  EOL.jobHistory.showMenu('sortJob');
    EOL.jobHistory.sort = type;
    EOL.jobHistory.sortOrder = order;
    EOL.jobHistory.sortResults();
}

EOL.jobHistory.sortUpdateLink = function(){
    if(EOL.jobHistory.sortOrder == 'asc'){
        sort = 'desc';
    } else {
        sort = 'asc';
    }
    $(EOL.jobHistory.sort + "_sort").href = "javascript:EOL.jobHistory.manipulateJobs(); EOL.jobHistory.setSort('"+EOL.jobHistory.sort+"','"+sort+"');";
}

EOL.jobHistory.manipulateJobs = function() {
        EOL.jobHistory.redirectToPage();
    return false;
    if(!EOL.jobHistory.initiated){
        EOL.jobHistory.initiateJobHistory();
    }

    if(EOL.jobHistory.hasEnoughJobs()){
        //EOL.jobHistory.reviewAllJobs();
    }
    if(EOL.jobHistory.numJobDisplayed == 0) {
        $('noneFound').removeClass('displayNone');
    }
}

EOL.jobHistory.hasEnoughJobs = function() {
    return EOL.jobHistory.numJobTotal > 1;
}

EOL.jobHistory.hasEveryJobs = function() {
    if(EOL.jobHistory.hasAllJobs) return true;
    if(parseInt(EOL.jobHistory.numJobTotal) <= parseInt(EOL.jobHistory.numJobAvailable)){
        EOL.jobHistory.hasAllJobs = true;
    } else {
    }
    return EOL.jobHistory.hasAllJobs;
}

EOL.jobHistory.searchKeyword = function(){
    EOL.jobHistory.filterSearchOn = true;
    if($('pastjob_search').value  == 'Search past jobs (in last 12 mos)'){
        $('pastjob_search').value = '';
    }
    EOL.jobHistory.redirectToPage();
}

EOL.jobHistory.clearSearch = function(redirect){
    $('pastjob_search').value = '';
    EOL.jobHistory.filterSearchOn = false;
        if(redirect) EOL.jobHistory.redirectToPage();
}

EOL.jobHistory.redirectToPage = function(){
    var filters = EOL.jobHistory.getFilterNSort();
    var parameters = $('job_url').value;
    filters = filters.replace(/^&/,'');
    if(filters){
         parameters += '?' + filters;
        if(EOL.jobHistory.filterSearchOn) parameters += '#search';
    }
    window.location = parameters;
}

EOL.jobHistory.initiateJobHistory = function() {
    if($('catid')) EOL.jobHistory.filterCategory = $('catid').value;
    if($('subcatid')) EOL.jobHistory.filterSubCategory = $('subcatid').value;
    if($('subcat_filter') && $('category_filter')){
        EOL.jobHistory.hideSubcategory($('category_filter').value);
    }
    EOL.jobHistory.filterTime = $('time_filter').value;
    EOL.jobHistory.filterRating = $('rating_filter').value;
    EOL.jobHistory.sort = $('sort').value;
    EOL.jobHistory.sortOrder  = $('order').value;
    EOL.jobHistory.numJobAvailable = $('project_available').value;
    if($('project_total') && $('project_total').value > 0){
	    EOL.jobHistory.cacheEnabled = true;
	    EOL.jobHistory.numJobTotal = $('project_total').value;
    }

	for(var index=0; index < EOL.jobHistory.numJobAvailable; index++){
		id = $('ec_'+index+'_jobid').value;
		currentJob = new Job(id, index);
		if(EOL.jobHistory.cacheEnabled) {
			if($('ec_' + index + '_date')) currentJob.tdate = $('ec_' + index + '_date').value;
		    if($('ec_' + index + '_ratings')) currentJob.ratings = $('ec_' + index + '_ratings').value;
		    if($('ec_' + index + '_catid')) currentJob.category = $('ec_' + index + '_catid').value;
		}
        EOL.jobHistory.jobList.push(currentJob);
    }
    EOL.jobHistory.initiated = true;

    if($('keyword').value) {
        $('pastjob_search').value = $('keyword').value;
        EOL.jobHistory.highlightKeywords();
        EOL.jobHistory.showAllJobDetails(true);
    } else if($('keywordCountShown').value) {
    	if($('noresults_text'))	//provider
        	$('noresults_text').innerHTML = $('keywordCountShown').value + " results found";
        else if($('noresults'))	//buyer
        	$('noresults').innerHTML = $('keywordCountShown').value + " results found";
        $('noresults').removeClass('displayNone');
    }
    EOL.jobHistory.userid = $('userid').value;
    EOL.jobHistory.catid = $('catid').value;
    EOL.jobHistory.numJobDisplayed = $('project_displayed').value;
    EOL.jobHistory.expandJobHistoryIfRequested();

    $$('div.jobhistory').addEvents({
        'mouseover': function(){
            if (this.getElement('div.shareFeedback')) {
                this.getElement('div.shareFeedback').removeClass('displayNone');
            }
        },
        'mouseleave': function(){
            if ( this.getElement('div.shareFeedback') ) {
                this.getElement('div.shareFeedback').addClass('displayNone');
                this.getElement('div.shareFeedback-dialog').addClass('displayNone');
            }
        }
    });

    $$('div.share-button').addEvent('click', function() {
        var sharedMenu = this.getParent().getParent().getElement('div.shareFeedback-dialog');
        if ( sharedMenu.hasClass('displayNone') ) {
            sharedMenu.removeClass('displayNone');
        } else {
            sharedMenu.addClass('displayNone');
        }
    });

}


EOL.jobHistory.sortResults = function() {
    EOL.jobHistory.redirectToPage();
}

EOL.jobHistory.filterResults = function() {
		if(!EOL.jobHistory.manipulateJobs()) return;
    var numJobs = EOL.jobHistory.jobList.length;
    var inlist = false;
        for(var j=0; j<numJobs; j++){
         var experience = $('experience_'+j).parentNode;
         if(EOL.jobHistory.isExperienceFiltered(j)){
            $(experience).addClass('displayNone');
         } else {
            if(!EOL.jobHistory.keywordSearchOn ||  EOL.jobHistory.jobList[j].keyword){
                $(experience).removeClass('displayNone');
                inlist = true;
            }
        }
        }
    if(!inlist) {
        $('noneFound').removeClass('displayNone');
    } else {
        $('noneFound').addClass('displayNone');
    }
}

EOL.jobHistory.isExperienceFiltered = function(index) {
    var filtered = false;

    if(EOL.jobHistory.isExperienceFilteredByTime(index) ||
       EOL.jobHistory.isExperienceFilteredByCategory(index) ||
       EOL.jobHistory.isExperienceFilteredByRating(index)) {
        filtered = true;
    }

    return filtered;
}

EOL.jobHistory.isExperienceFilteredByCategory = function(index) {
    filter = false;
        jobInfo = EOL.jobHistory.jobList[index];
        if(EOL.jobHistory.filterCategory == '' || !jobInfo.category){
        return filter;
    }
    if(jobInfo.category != EOL.jobHistory.filterCategory) {
        filter = true;
    }
    return filter;
}


EOL.jobHistory.isExperienceFilteredByTime = function(index) {
    filter = false;
    jobInfo = EOL.jobHistory.jobList[index];
    if(EOL.jobHistory.filterTime == '' || !jobInfo.tdate){
        return filter;
    }
    if(parseInt(jobInfo.tdate) < parseInt()){
        filter = true;
    }
    return filter;
}

EOL.jobHistory.isExperienceFilteredByRating = function(index) {
    filter = false;
    jobInfo = EOL.jobHistory.jobList[index];
    if(EOL.jobHistory.filterRating == '' || !jobInfo.ratings){
        return filter;
    }
    if(parseInt(jobInfo.ratings) > parseInt(EOL.jobHistory.filterRatingUp) ||
       parseInt(jobInfo.ratings) < parseInt(EOL.jobHistory.filterRatingLow)){
        filter = true;
    }
    return filter;
}


EOL.jobHistory.clickAwayMenu = function(event) {
    var el = null;

    if(window.event)
        el = window.event.srcElement;
    else
        el = (event.target.tagName) ? event.target : event.target.parentNode;

    do {
        if(el.id == 'filterRating'  || el.id == 'filterCategory' ||  el.id == 'filterSubCategory' || el.id == 'filterTime' || el.id == 'sortJob')
            return
        } while (el = el.parentNode);
    EOL.jobHistory.hideAllMenu();
}

EOL.jobHistory.showSubcategoryMenu = function(catid) {
	if(!catid)
		catid = '';

	$('filterCategory').innerHTML = '<img border=0 height=32 width=32 src="/media/images/4.0/ajax-loader.gif" style="margin: 30px 35px">';

	var path = '/php/profile/main/providerServices.php?';
	var options = {
		url: path + 'userid=' + $('userid').value + '&catid=' + catid + '&t=' + getDateTime(),
		method: 'get',
		onSuccess: function(response) {
			var data = JSON.decode(response);

			var container = new Element('div', {'class':'actionMenuItem'});
			var menuItem = new Element('ul').inject(container);

			for(var i=0; i<data.length; i++) {
				var item = data[i];
				var list = new Element('li');

				if(item.catid) {
					new Element('a', {
							'class':'actionLink',
							href: '#',
							html: item.name + ((item.count) ? ' (' + item.count + ')' : ''),
							events: {
								click: (function(cat) {
									return function() {
										EOL.jobHistory.setFilter('category', cat.catid);
										EOL.jobHistory.filterResults();
										EOL.jobHistory.filterShown('cat_filter', 'filterCategory', cat.name);
									}
								})(item)
							}
					}).inject(list);
				}
				else {
					//all subcats
					new Element('a', {
							'class':'actionLink',
							href: '#',
							html: item.name,
							events: {
								click: (function(cat) {
									return function() {
										EOL.jobHistory.setFilter('category', '');
										EOL.jobHistory.setFilter('subcategory', '');
										EOL.jobHistory.filterResults();
										EOL.jobHistory.filterShown('cat_filter', 'filterCategory', cat.name);
									}
								})(item)
							}
					}).inject(list);
				}
				list.inject(menuItem);
			}

			$('filterCategory').innerHTML = '';
			container.inject($('filterCategory'));
		}
	};

	curAsyncReq = new Request(options);
	curAsyncReq.send();

	EOL.jobHistory.hideAllMenu();
    EOL.jobHistory.hideThatMenu('filterCategory');
}


EOL.jobHistory.showMenu = function(menu) {
    EOL.jobHistory.hideAllMenu();
    EOL.jobHistory.hideThatMenu(menu);
}

EOL.jobHistory.hideThatMenu = function(menu) {
    $(menu).removeClass('displayNone');
    if( document.addEventListener ) { //mozilla
        document.addEventListener('mousedown', EOL.jobHistory.clickAwayMenu, false);
    } else if( document.attachEvent ) {  //ie
        document.attachEvent('onmousedown', EOL.jobHistory.clickAwayMenu);
    }
}

EOL.jobHistory.hideMenu  = function(menu) {
    if($(menu)) $(menu).addClass('displayNone');
}

EOL.jobHistory.hideAllMenu = function() {
    var menus = new Array('filterTime', 'filterCategory', 'filterSubCategory', 'filterRating', 'sortJob');
    for(var j=0; j<menus.length; j++){
        EOL.jobHistory.hideMenu(menus[j]);
    }

}

EOL.jobHistory.showAllJobDetails = function(show) {
    if(show){
        $('collapseall').className = 'collapse-all-icon-up';
        $('expandall').className = 'expand-all-icon-down';
        $('collapseall').onClick = 'EOL.jobHistory.showAllJobDetails(true)';
        $('expandall').onClick = 'EOL.jobHistory.showAllJobDetails(false)';
    } else {
        $('collapseall').className = 'collapse-all-icon-down';
        $('expandall').className = 'expand-all-icon-up';
        $('collapseall').onClick = 'EOL.jobHistory.showAllJobDetails(false)';
        $('expandall').onClick = 'EOL.jobHistory.showAllJobDetails(true)';
    }
    for(var j=0; j<EOL.jobHistory.numJobAvailable; j++){
        EOL.jobHistory.jobDetailsSectionShow(show, j);
    }
}

EOL.jobHistory.jobDetailsSectionShow = function(show, id) {
    if(show){
        $('details-pointer'+id).style.display = '';
        $('jobdescr'+id).removeClass('displayNone');
        $('jobdetails'+id).href= 'javascript:EOL.jobHistory.jobDetailsSectionShow(false,'+id+')';
        $('jobdetailsview'+id).className = 'collapse-job-details-arrow';
    } else {
        $('details-pointer'+id).style.display = 'none';
        $('jobdescr'+id).addClass('displayNone');
        $('jobdetails'+id).href= 'javascript:EOL.jobHistory.jobDetailsSectionShow(true,'+id+')';
        $('jobdetailsview'+id).className = 'expand-job-details-arrow';
    }
}

EOL.jobHistory.jobDetailsShow = function(show, id) {
    if(show){
        if($('jobdescr_more'+id)) {
        $('jobdescr_more'+id).removeClass('displayNone');
        $('jobdescr_moredot'+id).addClass('displayNone');
        $('jobdescr_viewmore'+id).addClass('displayNone');
                $('jobdescr_collapse'+id).removeClass('displayNone');
    }
    } else {
    if($('jobdescr_more'+id)) {
        $('jobdescr_more'+id).addClass('displayNone');
        $('jobdescr_moredot'+id).removeClass('displayNone');
        $('jobdescr_viewmore'+id).removeClass('displayNone');
        $('jobdescr_collapse'+id).addClass('displayNone');
    }
    }
}



EOL.jobHistory.highlightKeywords = function(){
    //EOL.jobHistory.manipulateJobs();
    EOL.jobHistory.keywordSearch = $('pastjob_search').value;
    if(EOL.jobHistory.keywordSearch != "") {
        EOL.jobHistory.keywordSearchOn = true;
    } else {
        EOL.jobHistory.keywordSearchOn = false;
    }
    EOL.jobHistory.keywordCount = $('keywordCount').value;
    highlightKeywordsOnPage();
       if(EOL.jobHistory.keywordCount > 0){
            $('keyword_count').innerHTML = $('keywordCountShown').value;
        $('someKW').removeClass('displayNone');
            $('noKW').addClass('displayNone');
        noResultsFound();
    } else {
            $('noKW').removeClass('displayNone');
        $('someKW').addClass('displayNone');
       }

}

EOL.jobHistory.expandJobHistoryIfRequested = function(){
	var h = window.location.hash;
	if(h.match(/#experience_/)) {
		var experience = h.replace('#experience_','');
		if(experience >= 0) {
			EOL.jobHistory.jobDetailsShow(true, experience);
			EOL.jobHistory.jobDetailsSectionShow(true, experience);
		}
	}
}

function highlightKeywordsOnPage(){
        $('noresults').addClass('displayNone');
    var keyword_found = false;
    var numJobs = EOL.jobHistory.jobList.length;
        for(var j=0; j<numJobs; j++){
        unhighlightIndex(j);
        var highlight = highlightKeywords(j);
        keyword_found = keyword_found || highlight;
    }
    if(!keyword_found) {
        noResultsFound();
        }

}

function noResultsFound(){
    var searchString = $('pastjob_search').value;
    if(searchString == '') return;
    $('keyword_search').innerHTML = EOL.utility.htmlspecialchars(searchString);
    $('noneFound').addClass('displayNone');
    $('noresults').removeClass('displayNone');
}

EOL.jobHistory.resetSearchRequest = function(){
    highlightKeywordsOnPage()
    $('noresults').addClass('displayNone');
    EOL.jobHistory.keywordSearchOn = false;
    EOL.jobHistory.filterResults();
}

function compareLT(x, y) {
        if(!isNaN( y[1]) && !isNaN( x[1] )) { a = parseInt(y[1]);b = parseInt(x[1]);
        } else { a =  y[1];b = x[1];}
        if ( a > b ) return -1;
        if ( a < b ) return 1;
        return 0; }
function compareGT(x, y) {
        if(!isNaN( y[1]) && !isNaN( x[1] )) { a = parseInt(y[1]);b = parseInt(x[1]);
        } else { a = y[1]; b = x[1];}
        if ( a < b ) return -1;
        if ( a > b ) return 1;
        return 0; }

function sortByOrder(A, order) {
        if(order == 'asc'){A.sort(compareLT)
        } else { A.sort(compareGT)}
        return A;}

function unhighlightIndex(jh_index) {
        var node = $("experience_"+jh_index);
        unhighlight(node)
}

function unhighlight(node) {
        // Iterate into this nodes childNodes
        if (node.hasChildNodes) {
        var hi_cn;
        for (hi_cn=0;hi_cn<node.childNodes.length;hi_cn++) {
        unhighlight(node.childNodes[hi_cn]);
        }
        }

        // And do this node itself
        if (node.nodeType == 3) { // text node
                pn = node.parentNode;
        if( pn.className == "highlighted" ) {
                prevSib = pn.previousSibling;
                nextSib = pn.nextSibling;
                var prevSibContent = '';
                var nextSibContent = '';
                if(prevSib) { prevSibContent = prevSib.nodeValue; prevSib.nodeValue = '';}
                if(nextSib) nextSibContent = nextSib.nodeValue
                nextSib.nodeValue = prevSibContent + node.nodeValue + nextSibContent;
                node.nodeValue = '';
        }
        }
}


function highlightKeywords(jh_index) {
    var searchString = $('pastjob_search').value;
    if(searchString == ''){
    EOL.jobHistory.filterSearchOn = false;
     return;
    }
    EOL.jobHistory.filterSearchOn = true;
    var textContainerNode = $("experience_"+jh_index);

    var containsKW = false;
    var searchTerms = searchString.split(' ');
    for (var i = 0; i < searchTerms.length; i++)        {
      var expression = ">([^<]*)?(" + searchTerms[i].replace(/\[/g,"") + ")([^>]*)?<";

      var regex = new RegExp(expression,"ig");
      if(highlightTextNodes(textContainerNode, regex)){
        containsKW = true;
      }
      //searchInfo += ' <span class="highlighted">'+searchTerms[i]+'</span> ';
    }


    var expeNode = $('experience_'+jh_index).parentNode;
    if(containsKW && !EOL.jobHistory.isExperienceFiltered(jh_index)){
    //  $(expeNode).removeClass('displayNone');
        EOL.jobHistory.jobList[jh_index].keyword = true;
        } else {
        //        $(expeNode).addClass('displayNone');
        EOL.jobHistory.jobList[jh_index].keyword = false;
        }
   return containsKW;
}


function highlightTextNodes(element, regex) {
  var tempinnerHTML = element.innerHTML;
  var match = tempinnerHTML.search(regex);
  if(match > 0){
        element.innerHTML = tempinnerHTML.replace(regex,'>$1<span class="highlighted">$2</span>$3<');
        //tempinnerHTML.replace(regex,function(){ EOL.jobHistory.keywordCount++;});
    return true;
  } else {
        return false;
  }
}




EOL.namespace('feedback');

EOL.feedback.dialog = null;


EOL.feedback.respondToFeedback = function(bidid) {
	var request = new Request({
		url: '/php/feedback/main/feedbackProviderAHR.php?bidid='+escape(bidid)+'&action=response'+'&t=' + getDateTime(), 
		method: 'get',
		onSuccess: function(req) {
			EOL.feedback.feedbackRespond(req);	
		},
		onFailure: function() {}
	}).send();
}

EOL.feedback.submitFeedback = function(bidid) {
	var postData = $('feedback_form').toQueryString();

	var options = {
		url: '/php/feedback/main/feedbackProviderAHR.php?bidid='+escape(bidid)+'&action=submitresponse'+'&t=' + getDateTime(), 
		method: 'post',
		data: postData,
		onSuccess: function(response) {
			EOL.feedback.feedbackSubmitted(response);	
		},
		onFailure: function() {alert('There was an error processing your request. Please try again.')}
	};
	
	var req = new Request(options);
	req.send();

}

EOL.feedback.close = function() {
	EOL.feedback.dialog.hide();
}

EOL.feedback.feedbackSubmitted  = function(req) {
	EOL.feedback.close();
	EOL.feedback.dialog = new EOL.dialog(req, {position: 'fixed', modal:true, width: 450, close:true});
	EOL.feedback.dialog.show();
	return;
}

EOL.feedback.feedbackRespond = function(req) {
	EOL.feedback.dialog = new EOL.dialog(req, {position: 'fixed', modal:true, width: 450, close:true});
	EOL.feedback.dialog.show();
	$('feedback_response').focus();
	return;
}

EOL.feedback.feedbackRequest = function(bidid) {
	var request = new Request({	url: '/php/feedback/main/feedbackProviderAHR.php?bidid='+escape(bidid)+'&action=request'+'&t=' + getDateTime(), 
								method: 'get',
								onSuccess: function(req) {
									EOL.feedback.feedbackRespond(req);
								},
								onFailure: function() {}
						}).send();
}

EOL.feedback.submitFeedbackRequest = function(bidid) {
	var postData = $('feedback_form').toQueryString();
	
	var options = {
		url: '/php/feedback/main/feedbackProviderAHR.php?bidid='+escape(bidid)+'&action=submitrequest'+'&t=' + getDateTime(), 
		method: 'post',
		data: postData,
		onSuccess: function(response) {
		        EOL.feedback.feedbackSubmitted(response);
		},
		onFailure: function() {alert('There was an error processing your request. Please try again.')}
	};
	
	var req = new Request(options);
	req.send();

}

