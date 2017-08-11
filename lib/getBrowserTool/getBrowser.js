/**
 * Created by shizhonghua on 2016/9/5.
 */
window.getBrowser = function(getVersion) {
    //×¢Òâ¹Ø¼ü×Ö´óÐ¡Ð´
    var ua_str = navigator.userAgent.toLowerCase(), ie_Tridents, trident, match_str, ie_aer_rv, browser_chi_Type;
    //ÅÐ¶ÏIE ä¯ÀÀÆ÷,
    //blog: http://blog.csdn.net/aerchi/article/details/51697592
    if("ActiveXObject" in self){
        // ie_aer_rv:  Ö¸Ê¾IE µÄ°æ±¾.
        // It can be affected by the current document mode of IE.
        ie_aer_rv= (match_str = ua_str.match(/msie ([\d.]+)/)) ?match_str[1] :
            (match_str = ua_str.match(/rv:([\d.]+)/)) ?match_str[1] : 0;

        // ie: Indicate the really version of current IE browser.
        ie_Tridents = {"trident/7.0": 11, "trident/6.0": 10, "trident/5.0": 9, "trident/4.0": 8};
        //Æ¥Åä ie8, ie11, edge
        trident = (match_str = ua_str.match(/(trident\/[\d.]+|edge\/[\d.]+)/)) ?match_str[1] : undefined;
        browser_chi_Type = (ie_Tridents[trident] || ie_aer_rv) > 0 ? "ie" : undefined;
    }else{
        //ÅÐ¶Ï windows edge ä¯ÀÀÆ÷
        // match_str[1]: ·µ»Øä¯ÀÀÆ÷¼°°æ±¾ºÅ,Èç: "edge/13.10586"
        // match_str[1]: ·µ»Ø°æ±¾ºÅ,Èç: "edge"
        browser_chi_Type = (match_str = ua_str.match(/edge\/([\d.]+)/)) ? "ie" :
            //ÅÐ¶Ïfirefox ä¯ÀÀÆ÷
            (match_str = ua_str.match(/firefox\/([\d.]+)/)) ? "firefox" :
                //ÅÐ¶Ïchrome ä¯ÀÀÆ÷
                (match_str = ua_str.match(/chrome\/([\d.]+)/)) ? "chrome" :
                    //ÅÐ¶Ïopera ä¯ÀÀÆ÷
                    (match_str = ua_str.match(/opera.([\d.]+)/)) ? "opera" :
                        //ÅÐ¶Ïsafari ä¯ÀÀÆ÷
                        (match_str = ua_str.match(/version\/([\d.]+).*safari/)) ? "safari" : undefined;
    }

    //·µ»Øä¯ÀÀÆ÷ÀàÐÍºÍ°æ±¾ºÅ
    var verNum, verStr;

    verNum = trident && ie_Tridents[trident] ? ie_Tridents[trident] : match_str[1];

    verStr = (getVersion != undefined) ? browser_chi_Type+"/"+verNum : browser_chi_Type;
    return  verStr;
};