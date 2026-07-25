// lang-manager.js

// 🌍 Global Translation Data Dictionary
const translations = {
    en: {
        navHome: "Home",
        navProperty: "List Property",
        navMap: "Explore Map View",
        navSupport: "Support",
        navSignIn: "Sign In",
        navDashboardText: "My Dashboard",
        heroTag: "Premium Local Verifications",
        heroTitle: "Find Handpicked Homestays Across Guwahati",
        heroSubtitle: "Skip the clinical hotels. Stay in authentic neighborhoods with trusted local hosts around Uzan Bazar, Paltan Bazar, and beyond.",
        loginTitle: "Welcome Back",
        loginSubtitle: "Access your individual profile pipeline dashboards",
        lblEmail: "Email Address",
        lblPassword: "Password"
    },
    as: {
        navHome: "হোম",
        navProperty: "সম্পত্তি তালিকাভুক্ত কৰক",
        navMap: "মানচিত্ৰ চাওক",
        navSupport: "সহায়তা",
        navSignIn: "ছাইন ইন",
        navDashboardText: "মোৰ ডেশ্বব’ৰ্ড",
        heroTag: "প্ৰিমিয়াম স্থানীয় প্ৰমাণীকৰণ",
        heroTitle: "গুৱাহাটীৰ নিৰ্বাচিত হোমষ্টে বিচাৰক",
        heroSubtitle: "হোটেল বাদ দিয়ক। উজান বজাৰ, পল্টন বজাৰ আৰু অন্যান্য অঞ্চলৰ বিশ্বাসী স্থানীয় লোকৰ সৈতে থাকক।",
        loginTitle: "স্বাগতম",
        loginSubtitle: "আপোনাৰ প্ৰ’ফাইল ডেশ্বব’ৰ্ডত প্ৰৱেশ কৰক",
        lblEmail: "ইমেইল ঠিকনা",
        lblPassword: "পাছৱৰ্ড"
    },
    hi: {
        navHome: "होम",
        navProperty: "प्रॉपर्टी जोड़ें",
        navMap: "नक्शा देखें",
        navSupport: "सहायता",
        navSignIn: "साइन इन",
        navDashboardText: "मेरा डैशबोर्ड",
        heroTag: "प्रीमियम स्थानीय सत्यापन",
        heroTitle: "गुवाहाटी में बेहतरीन होमस्टे खोजें",
        heroSubtitle: "साधारण होटलों को छोड़ें। उज़ान बाज़ार, पलटन बाज़ार और अन्य स्थानों पर भरोसेमंद स्थानीय मेज़बानों के साथ रहें।",
        loginTitle: "स्वागत है",
        loginSubtitle: "अपने प्रोफाइल डैशबोर्ड तक पहुंचें",
        lblEmail: "ईमेल पता",
        lblPassword: "पासवर्ड"
    }
};

function applyLanguage(lang) {
    const translation = translations[lang] || translations.en;
    
    Object.keys(translation).forEach(id => {
        const element = document.getElementById(id);
        if (!element) return;

        // 1. Handle Input/Textarea Placeholders
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation[id];
        } 
        // 2. Handle Browser Tab Title
        else if (id === 'pageTitle') {
            document.title = translation[id];
        } 
        // 3. Handle Standard Text
        else {
            element.textContent = translation[id];
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    const langSelector = document.getElementById("langSelector");
    if (!langSelector) return; // Safeguard if a page misses the selector dropdown
    
    const savedLang = localStorage.getItem("preferredLang") || "en";
    langSelector.value = savedLang;
    applyLanguage(savedLang);

    langSelector.addEventListener("change", (e) => {
        const selectedLang = e.target.value;
        localStorage.setItem("preferredLang", selectedLang);
        applyLanguage(selectedLang);
    });
});