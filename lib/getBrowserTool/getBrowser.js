/**
 * Created by shizhonghua on 2016/9/5.
 */
window.getBrowser = function(getVersion) {
    //ע��ؼ��ִ�Сд
    var ua_str = navigator.userAgent.toLowerCase(), ie_Tridents, trident, match_str, ie_aer_rv, browser_chi_Type;
    //�ж�IE �����,
    //blog: http://blog.csdn.net/aerchi/article/details/51697592
    if("ActiveXObject" in self){
        // ie_aer_rv:  ָʾIE �İ汾.
        // It can be affected by the current document mode of IE.
        ie_aer_rv= (match_str = ua_str.match(/msie ([\d.]+)/)) ?match_str[1] :
            (match_str = ua_str.match(/rv:([\d.]+)/)) ?match_str[1] : 0;

        // ie: Indicate the really version of current IE browser.
        ie_Tridents = {"trident/7.0": 11, "trident/6.0": 10, "trident/5.0": 9, "trident/4.0": 8};
        //ƥ�� ie8, ie11, edge
        trident = (match_str = ua_str.match(/(trident\/[\d.]+|edge\/[\d.]+)/)) ?match_str[1] : undefined;
        browser_chi_Type = (ie_Tridents[trident] || ie_aer_rv) > 0 ? "ie" : undefined;
    }else{
        //�ж� windows edge �����
        // match_str[1]: ������������汾��,��: "edge/13.10586"
        // match_str[1]: ���ذ汾��,��: "edge"
        browser_chi_Type = (match_str = ua_str.match(/edge\/([\d.]+)/)) ? "ie" :
            //�ж�firefox �����
            (match_str = ua_str.match(/firefox\/([\d.]+)/)) ? "firefox" :
                //�ж�chrome �����
                (match_str = ua_str.match(/chrome\/([\d.]+)/)) ? "chrome" :
                    //�ж�opera �����
                    (match_str = ua_str.match(/opera.([\d.]+)/)) ? "opera" :
                        //�ж�safari �����
                        (match_str = ua_str.match(/version\/([\d.]+).*safari/)) ? "safari" : undefined;
    }

    //������������ͺͰ汾��
    var verNum, verStr;

    verNum = trident && ie_Tridents[trident] ? ie_Tridents[trident] : match_str[1];

    verStr = (getVersion != undefined) ? browser_chi_Type+"/"+verNum : browser_chi_Type;
    return  verStr;
};