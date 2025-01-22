/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import { Lightning, Router } from '@lightningjs/sdk'
import { COLORS } from '../../colors/Colors'
import { CONFIG } from '../../Config/Config'
import { Language } from '@lightningjs/sdk';

const _privacyPolicy = `Privacy
 Welcome to RDKCentral.com, a website owned and operated by RDK Management, LLC (“RDK Management,” “we,” or “us”). This privacy policy discloses the privacy practices for this website only, including an explanation of:

 the categories of personally identifiable information about you that may be collected and how that information is used;
 how we collect and use non-personally identifiable information about your use of the website;
 the categories of persons or entities with whom the information may be shared;
 the choices that are available to you regarding collection, use, and distribution of the information;
 how you can opt out of RDK-related promotional e-mail;
 the kind of security procedures that are in place to protect the loss, misuse or alteration of information;
 how you can review and request changes to the information; and
 how we notify users of this website of changes to this privacy policy.
 Questions regarding this policy should be directed to “RDK Management – Privacy Feedback” and can be submitted via e-mail to info@rdkcentral.com.


 What categories of information do we collect?
 The information collected by RDK Management falls into two categories: (1) information voluntarily supplied by users of the website and (2) tracking information recorded as users navigate through the website. Some of this information is personally identifiable information (i.e., information that identifies a particular person, such as e-mail address), but much of it is not.

 To make use of some features on our website, like the RDK Wiki, users need to register and provide certain information as part of the registration process. We may ask, for example, for your name, e-mail address, street address, and zip code. We might also request information about your employer and the type of work that you do, in order to determine whether your employer is a member of the RDK program, to help us ensure that you are given access to the correct portions of the website, and to tailor our website content and e-mail (if you’ve registered to receive e-mail) to your interests to make it more useful to you. If you are a registered user, our systems will remember some of this information the next time you log in and use our website, but you can always review and change your information by logging in and editing your profile here.

 The more you tell us about yourself, the more value we can offer you. Supplying this information is entirely voluntary. But if you choose not to supply the information, we may be unable to provide you with access to all of the features of this website. There are certain features of this website, including the Wiki and requesting to receive RDK-related promotional e-mail, that you will not be able to use unless you provide certain personally identifiable information about yourself. When you submit any personally identifiable information over this website, RDK Management (i) will use the information for the purposes described at the time you submit it and (ii) may use the information to contact you, subject to the contact preferences in your profile. If you want to remain completely anonymous, you’re still free to take advantage of the publicly available content on our website without registration.

 Does RDK Management analyze my interaction with this website?
 Some of the third-party service providers that RDK Management uses to deliver services, like analytics providers, may collect information on this website as disclosed in this privacy policy. This information may include personally identifiable information or may be used to contact you online.

 We and our service providers may use cookies to provide these services. The World Wide Web Consortium (W3C) has started a process to develop a “Do Not Track” Standard. Since the definitions and rules for such a standard have not yet been defined, RDK Management does not yet respond to “Do Not Track” signals sent from browsers.

 You may opt out of receiving cookies from the companies that provide services on this website by going to www.networkadvertising.org/consumer/opt_out.asp or http://www.aboutads.info/choices.

 What categories of persons or entities do we share personally identifiable information with?
 We consider the personally identifiable information contained in our business records to be confidential. We may sometimes disclose personally identifiable information about you to our affiliates or to others who work for us. We may also disclose personally identifiable information about you to service providers and vendors, and to others who provide products and services to us. For example, when you use certain functions on this website you may notice that the website actually collecting or processing the information may be other than an RDK Management website. We may be required by law or legal process to disclose certain personally identifiable information about you to lawyers and parties in connection with litigation and to law enforcement personnel. For example, we may be required by law to disclose personally identifiable information about you without your consent and without notice in order to comply with a valid legal process such as a subpoena, court order, or search warrant.

 What do we do to personalize your use of this website?
 We, or our service providers, may customize this website based on non-personal information including: (i) the IP address associated with your computer for purposes of determining your approximate geographic location; (ii) the type of web page that is being displayed; or (iii) the content on the page that is shown. Because this activity automatically applies to all users and it is purely contextual, this type of content delivery cannot be customized or controlled by individual users. We may also personalize this website based on the information that you provided us during registration. You may modify this information as further described in this Privacy Policy.

 To help make our website more responsive to the needs of our users, we use a standard feature of browser software called a “cookie.” We use cookies to help us tailor our website to your needs, to deliver a better, more personalized service, and to remember certain choices you’ve made so you don’t have to re-enter them.

 RDK Management uses cookies, among other things, to remember your username and password, if you choose to store them, as well as to remember some of your personalization preferences and website features. RDK Management does not store your name or other personal information in cookies. You may read about enabling, disabling, and deleting cookies here. Of course, if you set your browser not to accept cookies or you delete them, you may not be able to take advantage of the personalized features enjoyed by other users of our website.

 The cookies we use don’t directly identify users of our website as particular persons. Rather, they contain information sufficient to simplify and improve a user’s experience on our website. For example, we may use session-based cookies to track the pages on our website visited by our users. We can build a better website if we know which pages our users are visiting and how often. Or, we may use persistent cookies to simplify access to a user’s account information over our website, for example.

 In connection with the standard operation of RDK Management’s systems, certain non-personally identifiable information about users of this website is recorded. This information is used primarily to tailor and enhance users’ experience using the website. We may use this information in an aggregate, non-personally identifiable form to, among other things, measure the use of our website and determine which pages are the most popular with website users.

 We may also use one or more audience segmenting technology providers to help present content on this website. These providers uses cookies, web beacons, or similar technologies on your computer or mobile or other device to serve you advertisements or content tailored to interests you have shown by browsing on this and other websites you have visited. It also helps determine whether you have seen a particular piece of content before and in order to avoid sending you duplicates. In doing so, these providers collect non-personally identifiable information such as your browser type, your operating system, web pages visited, time of visits, content viewed, ads viewed, and other click stream data. When you visit this website, these providers may use cookies or web beacons to note which product and service descriptions your browser visited. The use of cookies, web beacons, or similar technologies by these providers is subject to their own privacy policies, not RDK Management’s privacy policy for this website. If you do not want the benefits of the cookies used by these providers, you may opt-out of them by visiting http://www.networkadvertising.org/consumer/opt_out.asp or by visiting their opt-out pages.

 Your Access to and Control over your information?
 You may opt out of any future contacts from us at any time. You can do the following at any time via email to support@rdkcentral.com or info@rdkcentral.com or unsubscribe to emails.

 Request to see all the information stored in the system
 Accuracy of your data can be checked or corrected.
 Personal data will be archived, in case user does not access our system for 90 days. However, user can request for deletion by writing to us at support@rdkcentral.com
 Express any concern you have about our use of your data
 Opt out from receiving emails by clicking unsubscribe.
 How do users opt out of RDK-related promotional e-mail?
 You can opt out of receiving RDK-related promotional e-mail from RDK Management using the opt-out link found in the footer of any of these e-mails. You can also e-mail the request to the attention of “RDK Management – E-mail Opt Out” via e-mail to info@rdkcentral.com.

 Other Websites

 To make our website more valuable to our users, we may offer some features in conjunction with other providers. Our website may also include links to other websites whose privacy policies and practices we don’t control. Once you leave our website by linking to another one (you can tell where you are by checking the address – known as a URL – in the location bar on your browser), use of any information you provide is governed by the privacy policy of the operator of the website you’re visiting. That policy may differ from ours. If you can’t find the privacy policy of any of these websites via a link from the site’s homepage, you should contact the website directly for more information.

 Security

 All information gathered on our website is stored within a database accessible only to RDK Management, its affiliates, and their specifically-authorized contractors and vendors. However, as effective as any security measure implemented by RDK Management may be, no security system is impenetrable. We cannot guarantee the complete security of our database, nor can we guarantee that information you supply won’t be intercepted while being transmitted to us over the Internet. If you don’t want us to know any particular information about you, don’t include it in anything that you submit or post to this website or send to us in e-mail. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.

 Changes to this Privacy Policy

 We may change this privacy policy from time to time. If we change this privacy policy at some point in the future, we’ll post the changes on our website and by continuing to use the website after we post any changes, you accept and agree to this privacy statement, as modified.

 A Special Note About Children

 This website is not directed to children under the age of 13, and RDK Management does not knowingly collect personally identifiable information from anyone under the age of 18 on this website.

 Contacting us:

 If you have any questions about RDK Management, LLC privacy policy, the data we hold on you, or you would like to exercise one of your data protection rights, please do not hesitate to contact us.

 Data Protection Officer:  Herman-Jan Smith

 Email us at: hj.smith@rdkcentral.com

 Contacting the appropriate authority:

 Should you wish to report a complaint or if you feel that Our Company has not addressed your concern in a satisfactory manner, you may contact the Information Commissioner’s Office.

 Email: compliance_team@rdkcentral.com

 Address:  1701 JFK Boulevard, Philadelphia, PA 19103 U.S.A`

export default class PrivacyPolicyScreen extends Lightning.Component {

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Other Settings  Privacy  Policy'));
    }

    pageTransition() {
        return 'left'
    }


    static _template() {
        return {
            rect: true,
            color: 0xCC000000,
            w: 1920,
            h: 1080,
            clipping: true,
            PrivacyPolicy: {
                x: 200,
                y: 270,
                Title: {
                    x: 10,
                    y: 45,
                    mountY: 0.5,
                    text: {
                        text: Language.translate('Privacy Policy'),
                        textColor: COLORS.titleColor,
                        fontFace: CONFIG.language.font,
                        fontStyle: "bold",
                        fontSize: 40,
                    }
                },
                Content: {
                    x: 10,
                    y: 100,
                    text: {
                        text: _privacyPolicy,
                        textColor: COLORS.titleColor,
                        fontFace: CONFIG.language.font,
                        fontSize: 20,
                        wordWrapWidth: 1500,
                        wordWrap: true,
                    }
                }
            }
        }
    }

    _handleDown() {
        if (this.tag("PrivacyPolicy").y > -2400) {
            this.tag("PrivacyPolicy").y -= 35;
        }
    }

    _handleBack() {
        if(!Router.isNavigating()){
        Router.navigate('settings/other/privacy')
        }
    }

    _handleUp() {
        if (this.tag("PrivacyPolicy").y <= 235) {
            this.tag("PrivacyPolicy").y += 35;
        }
    }


}