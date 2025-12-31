import React from "react";
import { assets } from "../assets/assets";
import { motion as Motion } from "motion/react";
import { useAppContext } from "../context/AppContext";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

const Footer = () => {
  const { t } = useAppContext();
  return (
    <footer className="px-6 md:px-16 lg:px-24 xl:px-32 mt-48 text-sm text-gray-500">
      <Motion.div
        {...fadeUp(0)}
        className="flex flex-wrap justify-between items-start gap-10 pb-10 border-b border-borderColor"
      >
        <div className="max-w-sm">
          <Motion.img
            {...fadeUp(0.2)}
            src={assets.logo}
            alt="logo"
            className="h-9 mb-3"
          />

          <Motion.p {...fadeUp(0.3)} className="leading-relaxed">
            {t('footer_tagline')}
          </Motion.p>

          <Motion.div
            {...fadeUp(0.4)}
            className="flex items-center gap-4 mt-6"
          >
            {[assets.facebook_logo, assets.instagram_logo, assets.twitter_logo, assets.gmail_logo].map(
              (logo, i) => (
                <a key={i} href="#">
                  <img src={logo} className="w-5 h-5 hover:opacity-70 transition" />
                </a>
              )
            )}
          </Motion.div>
        </div>

        <Motion.div
          {...fadeUp(0.3)}
          className="flex flex-wrap justify-between w-full md:w-1/2 gap-10"
        >
          <div>
            <h2 className="text-base font-medium text-gray-900 uppercase tracking-wide">
              {t('footer_quick_links')}
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              <li>
                <a className="hover:text-gray-700 transition" href="#">
                  {t('footer_link_home')}
                </a>
              </li>
              <li>
                <a className="hover:text-gray-700 transition" href="#">
                  {t('footer_link_browse_cars')}
                </a>
              </li>
              <li>
                <a className="hover:text-gray-700 transition" href="#">
                  {t('footer_link_list_your_car')}
                </a>
              </li>
              <li>
                <a className="hover:text-gray-700 transition" href="#">
                  {t('footer_link_about_us')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-medium text-gray-900 uppercase tracking-wide">
              {t('footer_resources')}
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              <li>
                <a className="hover:text-gray-700 transition" href="#">
                  {t('footer_link_help_center')}
                </a>
              </li>
              <li>
                <a className="hover:text-gray-700 transition" href="#">
                  {t('footer_link_terms_of_service')}
                </a>
              </li>
              <li>
                <a className="hover:text-gray-700 transition" href="#">
                  {t('footer_link_privacy_policy')}
                </a>
              </li>
              <li>
                <a className="hover:text-gray-700 transition" href="#">
                  {t('footer_link_insurance')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-medium text-gray-900 uppercase tracking-wide">
              {t('footer_contact')}
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              <li>{t('footer_contact_address_line1')}</li>
              <li>{t('footer_contact_address_line2')}</li>
              <li>{t('footer_contact_phone')}</li>
              <li>{t('footer_contact_email')}</li>
            </ul>
          </div>
        </Motion.div>
      </Motion.div>

      <Motion.div
        {...fadeUp(0.5)}
        className="flex flex-col md:flex-row gap-3 items-center justify-between py-6 text-gray-600"
      >
        <p>© {new Date().getFullYear()} Brand. {t('footer_copyright')}</p>

        <ul className="flex items-center gap-4">
          <React.Fragment>
            <li>
              <a className="hover:text-gray-800 transition" href="#">
                {t('footer_link_privacy')}
              </a>
            </li>
            <span>|</span>
            <li>
              <a className="hover:text-gray-800 transition" href="#">
                {t('footer_link_terms')}
              </a>
            </li>
            <span>|</span>
            <li>
              <a className="hover:text-gray-800 transition" href="#">
                {t('footer_link_cookies')}
              </a>
            </li>
          </React.Fragment>
        </ul>
      </Motion.div>
    </footer>
  );
};

export default Footer;
