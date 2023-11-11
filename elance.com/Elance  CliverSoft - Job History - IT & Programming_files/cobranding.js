

EOL.namespace('cobranding');

EOL.cobranding.arguments = null;

EOL.cobranding.mpidCookie = "userexperience";
EOL.cobranding.mpidCookieParam = "cobranding_mpid";
EOL.cobranding.logoPathCookieParam = "cobranding_logo_path";
EOL.cobranding.logoUrlCookieParam = "cobranding_logo_url";
EOL.cobranding.lastUpdatedCookieParam = "cobranding_last_updated";
EOL.cobranding.ttl = 60 * 60 * 1000; //1 hour TTL (60 seconds * 60 minutes * 1000ms)
EOL.cobranding.forceRefresh = false;

EOL.cobranding.logoSelectors = ['a.nav-m-logo',
                                'a.nav-v-logo',
                                'a.nav-v-logo-a',
                                'a.nav-logo-elance',
                                'a.nav-logo-elance-a',
                                'a.nav-logo-elance-your-way',
                                'div.nav-logo-elance-your-way',
                                'a.nav-logo-elance-your-way-a',
                                'a.nav-logo-elance-contact-a',
                                'a.nav-logo-elance-notabs-a'];

EOL.cobranding.vLogoSelectors = ['a.nav-v-logo',
                                 'a.nav-v-logo-a',
                                 'a.nav-logo-elance',
                                 'a.nav-logo-elance-a',
                                 'a.nav-logo-elance-your-way',
                                 'div.nav-logo-elance-your-way',
                                 'a.nav-logo-elance-your-way-a',
                                 'a.nav-logo-elance-contact-a',
                                 'a.nav-logo-elance-notabs-a'];

EOL.cobranding.newClasses = ['cobranding-nav-m-logo',
                             'cobranding-nav-v-logo',
                             'cobranding-nav-v-logo-a',
                             'cobranding-nav-logo-elance',
                             'cobranding-nav-logo-elance',
                             'cobranding-nav-logo-elance-a',
                             'cobranding-nav-logo-elance-your-way',
                             'cobranding-nav-logo-elance-your-way-a',
                             'cobranding-nav-logo-elance-contact-a',
                             'cobranding-nav-logo-elance-notabs-a'];

/**
 * EOL.cobranding.init
 *
 * Init the
 */
EOL.cobranding.init = function(){
    EOL.cobranding.persistMPID();
    EOL.cobranding.getLogo(EOL.cobranding.getMPID());
}

EOL.cobranding.hasLogoCookies = function(){
    return hasCookieParam(EOL.cobranding.mpidCookie, EOL.cobranding.logoUrlCookieParam) &&
           hasCookieParam(EOL.cobranding.mpidCookie, EOL.cobranding.logoPathCookieParam);
}

EOL.cobranding.getLogo = function(mpid){

    if (EOL.cobranding.hasLogoCookies()){

        var logo_path = getCookieParam(EOL.cobranding.mpidCookie, EOL.cobranding.logoPathCookieParam);
        var logo_url = getCookieParam(EOL.cobranding.mpidCookie, EOL.cobranding.logoUrlCookieParam);

        var logo_last_updated = getCookieParam(EOL.cobranding.mpidCookie, EOL.cobranding.lastUpdatedCookieParam);

        if (logo_last_updated != parseInt(logo_last_updated)) {
            logo_last_updated = 0;
        }

        var time_now = getDateTime();
        var time_diff = time_now - logo_last_updated;

        if (time_diff > EOL.cobranding.ttl) {
            EOL.cobranding.sendLogoRequest(mpid);
        } else {
            EOL.cobranding.swapLogo(logo_path, logo_url);
            EOL.cobranding.showLogos();
            EOL.cobranding.addPTCLogo();
        }

    } else {
        EOL.cobranding.sendLogoRequest(mpid);
    }
}


EOL.cobranding.sendLogoRequest = function(mpid) {
    if (mpid && mpid.length > 0){
        var request = new Request({ url: '/php/marketing/main/cobranding.php?mpid='+ mpid +'&t=' + getDateTime(),
                                method: 'get',
                                onSuccess: function(req) {
                                    var response = eval('(' + req + ')');
                                    if (response.status == 'success')
                                    {
                                        setCookieParam(EOL.cobranding.mpidCookie, EOL.cobranding.logoPathCookieParam+'='+response.data.logo_path);
                                        setCookieParam(EOL.cobranding.mpidCookie, EOL.cobranding.logoUrlCookieParam+'='+response.data.logo_url);
                                        setCookieParam(EOL.cobranding.mpidCookie, EOL.cobranding.lastUpdatedCookieParam+'='+getDateTime());
                                        EOL.cobranding.swapLogo(response.data.logo_path, response.data.logo_url);
                                        EOL.cobranding.showLogos();
                                        EOL.cobranding.addPTCLogo();
                                    } else {
                                        EOL.cobranding.showLogos();
                                    }

                                },
                                onFailure: function() {
                                    EOL.cobranding.showLogos();
                                }
                       }).send();
    } else {
        EOL.cobranding.showLogos();
    }
}

EOL.cobranding.showLogos = function(){
    EOL.cobranding.logoSelectors.each(function(item,index){
        $$(item).each(function(ele){
            ele.set('style', 'visibility:visible;');
        });
    });
}

EOL.cobranding.swapLogo = function(path, url) {
    //cobranding logo content elements
    cobrandingLogo = '<img src="' + path + '" class="cobranding-logo" />';

    EOL.cobranding.logoSelectors.each(function(item,index){
        isVisitorLogo = EOL.cobranding.vLogoSelectors.contains(item);
        canReplaceVisitorLogo = window.location.href.indexOf("/login") > -1 ||
                                window.location.href.indexOf("/logout") > -1 ||
                                window.location.href.indexOf("/register/contractor") > -1 ||
                                window.location.href.indexOf("/users/signup") > -1 ||
                                window.location.href.indexOf("/php/reg/main/createAccount.php") > -1 ||
                                window.location.href.indexOf("/php/reg/main/creatingAccount.php") > -1 ||
                                window.location.href.indexOf("/php/reg/main/creatingProviderAccount.php") > -1 ||
                                window.location.href.indexOf("/php/reg/main/provPlan.php") > -1 ||

                                window.location.href.indexOf("/php/post/main/jobDescribe.php") > -1 ||
                                window.location.href.indexOf("/php/post/main/jobPreview.php") > -1 ||
                                window.location.href.indexOf("/php/post/main/jobVerify.php") > -1 ||
                                window.location.href.indexOf("/php/reg/main/providerpayment.php") > -1 ||
                                window.location.href.indexOf("/php/post/main/jobPosting.php") > -1 ||
                                window.location.href.indexOf("/php/post/main/jobProceed.php");

        if (!isVisitorLogo ||
            (isVisitorLogo && canReplaceVisitorLogo))
        {
            //replace nav-m-logo instances.
            $$(item).each(function(ele){
                ele.set('href', url);
                ele.set('html', cobrandingLogo);
                ele.addClass(EOL.cobranding.newClasses[index]);
            });
        }
    });
}

EOL.cobranding.addPTCLogo = function() {
    //add ptc logo to member nav
    if($('nav-account-menu') && !$('nav-ptc-logo')) {
        var ptc = new Element('img',{
            id: 'nav-ptc-logo',
            src: '/media/images/4.0/nav/ptc_logo.png',
            width: 173,
            height: 14,
            'class': 'nav-ptc-logo'
        });
        ptc.inject($('nav-account'),'before');
    }
}

/**
 * EOL.cobranding.persistMPID
 *
 * Helper function to store an mpid in the cobranding mpid cookie, if it doesn't already exist.
 */

EOL.cobranding.persistMPID = function(){
    var args = EOL.cobranding.getArguments();

    if (EOL.cobranding.urlContainsMPID(args) && !EOL.cobranding.getMPIDCookie()){
        setCookieParam(EOL.cobranding.mpidCookie, EOL.cobranding.mpidCookieParam+'='+args.mpid);
    }
}

/**
 * EOL.cobranding.getMPIDCookie
 *
 * Helper function to determine if the mpid has been persisted in a cookie.
 */
EOL.cobranding.getMPIDCookie = function(){
    if (hasCookieParam(EOL.cobranding.mpidCookie, EOL.cobranding.mpidCookieParam)){
        return getCookieParam(EOL.cobranding.mpidCookie, EOL.cobranding.mpidCookieParam);
    }
    return null;
}

/**
 * EOL.cobranding.getMPID
 *
 * Helper function that checks first the cobranding mpid cookie, then the url.
 */

EOL.cobranding.getMPID = function() {
    var args = EOL.cobranding.getArguments();
    mpid = EOL.cobranding.getMPIDCookie();

    if (mpid != null) {
        return mpid;
    } else if (args.hasOwnProperty('mpid')) {
        return args.mpid;
    }

    return false;
}

/**
 * EOL.cobranding.getArguments
 *
 * Helper function to retrieve an object of URL arguments
 */
EOL.cobranding.getArguments = function(){

    if (EOL.cobranding.arguments != null) {
        return EOL.cobranding.arguments;
    }

    var args = new Object();
    var query = location.search.substring(1);
    var pairs = query.toLowerCase().split("&");
    for(var i = 0; i < pairs.length; i++) {
    var pos = pairs[i].indexOf('=');
    if( pos == -1 ) continue;
        var argname = pairs[i].substring(0,pos);
        var value = pairs[i].substring(pos+1);
        value = decodeURIComponent(value);
        args[argname] = value;
    }
    EOL.cobranding.arguments = args;
    return args;

}

/**
 * EOL.cobranding.urlContainsMPID
 *
 * Helper function to determine if the url has an mpid argument.
 */
EOL.cobranding.urlContainsMPID = function(args){
    return args.hasOwnProperty('mpid');
}

window.addEvent('domready', function(){
   EOL.cobranding.init();
});