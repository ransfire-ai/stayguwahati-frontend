'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home,
  LogOut,
  Plus,
  Plane,
  Heart,
  History,
  IdCard,
  Building2,
  Star,
  CalendarCheck,
  List,
  X,
  Send,
  MapPin,
  MessageSquare,
  ArrowRight,
  Loader2,
  Calendar
} from 'lucide-react';

const BACKEND_URL = 'https://stayguwahati-backend.onrender.com';

// Authentication/session security
// - Closing the browser/tab logs the user out because the auth token is stored
//   only in sessionStorage by this dashboard.
// - Inactivity timeout logs the user out automatically after 30 minutes.
// - Activity includes mouse, keyboard, touch, scroll and pointer interaction.
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
const INACTIVITY_CHECK_INTERVAL_MS = 60 * 1000;

interface UserProfile {
  name: string;
  email: string;
}

interface Property {
  _id?: string;
  id?: string;
  title?: string;
  propertyName?: string;
  locality?: string;
  location?: string;
  city?: string;
  address?: string;
  price?: number;
  pricePerNight?: number;
  image?: string;
  imageUrl?: string;
  propertyImage?: string;
  images?: string[];
  status?: string;
  rating?: number;
  reviewsCount?: number;
  hostEmail?: string;
  ownerEmail?: string;
  userEmail?: string;
  host?: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    isVerified?: boolean;
  };
}

interface Booking {
  _id?: string;
  id?: string;
  email?: string;
  guestEmail?: string;
  userEmail?: string;
  hostEmail?: string;
  ownerEmail?: string;
  guestName?: string;
  userName?: string;
  name?: string;
  guest?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  guestPhone?: string;
  recipientPhone?: string;
  userPhone?: string;
  propertyName?: string;
  title?: string;
  propertyId?: any;
  homestayId?: any;
  property?: any;
  location?: string;
  totalPrice?: number;
  price?: number;
  payout?: number;
  dates?: string;
  checkInDate?: string;
  checkIn?: string;
  checkOutDate?: string;
  checkOut?: string;
  createdAt?: string;
  image?: string;
  propertyImage?: string;
  images?: string[];
  status?: string;
  guests?: number;
  specialRequests?: string;
}

interface ChatMessage {
  _id?: string;
  senderName: string;
  guestName: string;
  propertyTitle: string;
  message: string;
  createdAt?: string;
}

type Language = 'en' | 'as' | 'hi';

const dictionary = {
  en: {
    welcome: "Hello",
    subTextTraveler: "Manage your traveler reservations and local itineraries.",
    subTextHost: "Oversee property listings, analyze data, and manage income tracks.",
    switchHost: "Switch to Host Mode",
    switchTraveler: "Switch to Traveler Mode",
    listProp: "List New Property",
    travelerHead: "Your Bookings & Trips",
    upcoming: "Upcoming Stay",
    viewReceipt: "View Receipt →",
    wishlistHead: "Your Saved Wishlists",
    historyHead: "Past Trips History",
    completed: "Completed",
    profileHead: "Traveler Profile Credentials",
    labelName: "Display / Preferred Name",
    labelEmail: "Email Coordinates",
    updateBtn: "Update Settings Data",
    hostHead: "Your Managed Properties Directory",
    incomeLabel: "Monthly Income",
    listingsLabel: "Active Listings",
    ratingLabel: "Platform Rating",
    pipelineHead: "Reservation Control Pipeline",
    thG: "Guest",
    thP: "Property",
    thD: "Dates",
    thPay: "Payout",
    thS: "Status",
    thA: "Actions",
    statusConf: "Confirmed",
    activeListHead: "Your Active Listings",
    msgBtn: "Message",
    noBookings: "No upcoming bookings found. Explore properties to book your next stay!",
    noWishlist: "Your wishlist is currently empty.",
    noHistory: "No past trips recorded.",
    noReservations: "No reservations found in your pipeline.",
    noProperties: "No properties listed by you yet."
  },
  as: {
    welcome: "নমস্কাৰ",
    subTextTraveler: "আপোনাৰ ভ্ৰমণ সংৰক্ষণ আৰু স্থানীয় ভ্ৰমণসূচী পৰিচালনা কৰক।",
    subTextHost: "সম্পত্তিৰ তালিকা পৰীক্ষা কৰক, তথ্য বিশ্লেষণ কৰক, আৰু উপাৰ্জন ট্ৰেক পৰিচালনা কৰক।",
    switchHost: "হোষ্ট মোডলৈ সলনি কৰক",
    switchTraveler: "ভ্ৰমণকাৰী মোডলৈ সলনি কৰক",
    listProp: "নতুন সম্পত্তি তালিকাভুক্ত কৰক",
    travelerHead: "আপোনাৰ বুকিং আৰু ভ্ৰমণসমূহ",
    upcoming: "অনাগত থকাৰ ব্যৱস্থা",
    viewReceipt: "ৰচিদ চাওক →",
    wishlistHead: "আপোনাৰ সংৰক্ষিত ইচ্ছাতালিকা",
    historyHead: "অতীতৰ ভ্ৰমণ ইতিহাস",
    completed: "সম্পূৰ্ণ হ’ল",
    profileHead: "ভ্ৰমণকাৰী প্ৰফাইলৰ প্ৰমাণপত্ৰ",
    labelName: "প্ৰদৰ্শন / পছন্দৰ নাম",
    labelEmail: "ইমেইল ঠিকনা",
    updateBtn: "ছেটিংছ ডাটা আপডেট কৰক",
    hostHead: "আপোনাৰ পৰিচালিত সম্পত্তি নিৰ্দেশিকা",
    incomeLabel: "মাহিলী উপাৰ্জন",
    listingsLabel: "সক্ৰিয় তালিকাসমূহ",
    ratingLabel: "প্লেটফৰ্ম ৰেটিং",
    pipelineHead: "সংৰক্ষণ নিয়ন্ত্ৰণ পাইপলাইন",
    thG: "অতিথি",
    thP: "সম্পত্তি",
    thD: "তাৰিখ",
    thPay: "পৰিশোধ",
    thS: "স্থিতি",
    thA: "কাৰ্য্যসমূহ",
    statusConf: "নিশ্চিত কৰা হৈছে",
    activeListHead: "আপোনাৰ সক্ৰিয় তালিকাসমূহ",
    msgBtn: "বাৰ্তা পঠিয়াওক",
    noBookings: "কোনো অনাগত বুকিং পোৱা নগ’ল। আপোনাৰ পৰৱৰ্তী ভ্ৰমণৰ বাবে সম্পত্তি অন্বেষণ কৰক!",
    noWishlist: "আপোনাৰ ইচ্ছাতালিকা বৰ্তমান খালী।",
    noHistory: "কোনো অতীতৰ ভ্ৰমণ ৰেকৰ্ড কৰা হোৱা নাই।",
    noReservations: "পাইপলাইনত কোনো সংৰক্ষণ পোৱা নগ’ল।",
    noProperties: "আপোনাৰ দ্বাৰা কোনো সম্পত্তি তালিকাভুক্ত কৰা হোৱা নাই।"
  },
  hi: {
    welcome: "नमस्ते",
    subTextTraveler: "अपनी यात्री बुकिंग और स्थानीय यात्रा कार्यक्रमों का प्रबंधन करें।",
    subTextHost: "संपत्ति लिस्टिंग की देखरेख करें, डेटा का विश्लेषण करें और आय ट्रैक प्रबंधित करें।",
    switchHost: "होस्ट मोड पर जाएं",
    switchTraveler: "यात्री मोड पर जाएं",
    listProp: "नई संपत्ति सूचीबद्ध करें",
    travelerHead: "आपकी बुकिंग और यात्राएं",
    upcoming: "आगामी प्रवास",
    viewReceipt: "रसीद देखें →",
    wishlistHead: "आपकी सहेजी गई विशलिस्ट",
    historyHead: "पुरानी यात्राओं का इतिहास",
    completed: "पूर्ण",
    profileHead: "यात्री प्रोफ़ाइल क्रेडेंशियल",
    labelName: "प्रदर्शित / पसंदीदा नाम",
    labelEmail: "ईमेल आईडी",
    updateBtn: "प्रोफ़ाइल डेटा अपडेट करें",
    hostHead: "आपकी प्रबंधित संपत्तियों की निर्देशिका",
    incomeLabel: "मासिक आय",
    listingsLabel: "सक्रिय लिस्टिंग",
    ratingLabel: "प्लेटफ़ॉर्म रेटिंग",
    pipelineHead: "बुकिंग नियंत्रण पाइपलाइन",
    thG: "अतिथि",
    thP: "संपत्ति",
    thD: "तारीखें",
    thPay: "भुगतान",
    thS: "स्थिति",
    thA: "कार्रवाई",
    statusConf: "पुष्टि की गई",
    activeListHead: "आपकी सक्रिय लिस्टिंग",
    msgBtn: "संदेश भेजें",
    noBookings: "कोई आगामी बुकिंग नहीं मिली। अपनी अगली यात्रा बुक करने के लिए संपत्तियों का अन्वेषण करें!",
    noWishlist: "आपकी विशलिस्ट वर्तमान में खाली है।",
    noHistory: "कोई पुरानी यात्रा दर्ज नहीं की गई है।",
    noReservations: "आपकी पाइपलाइन में कोई आरक्षण नहीं मिला।",
    noProperties: "आपके द्वारा अभी तक कोई संपत्ति सूचीबद्ध नहीं की गई है।"
  }
};

function resolveImageUrl(imagePath?: string | null): string {
  if (!imagePath) return 'https://via.placeholder.com/400x200?text=No+Photo';
  if (imagePath.startsWith('data:') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${BACKEND_URL}/${cleanPath}`;
}

export default function DashboardPage() {
  const router = useRouter();

  // User & State initialization
  const [currentUser, setCurrentUser] = useState<UserProfile>({ name: 'User', email: 'user@example.com' });
  const [currentRole, setCurrentRole] = useState<'traveler' | 'host'>('traveler');
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [editProfileName, setEditProfileName] = useState('');

  // Data states
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [hostProperties, setHostProperties] = useState<Property[]>([]);
  const [hostReservations, setHostReservations] = useState<Booking[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [hostRating, setHostRating] = useState<number>(0);

  // Loading states
  const [loadingTraveler, setLoadingTraveler] = useState(true);
  const [loadingHostProps, setLoadingHostProps] = useState(true);
  const [loadingReservations, setLoadingReservations] = useState(true);

  // Modals state
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // Chat State
  const [activeChat, setActiveChat] = useState<{ guestName: string; propTitle: string; guestPhone: string }>({
    guestName: '',
    propTitle: '',
    guestPhone: ''
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInputText, setChatInputText] = useState('');
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const chatPollInterval = useRef<NodeJS.Timeout | null>(null);

  const t = dictionary[currentLang] || dictionary.en;

  // Mount/Auth Check + strong session security.
  //
  // Security model:
  // 1. Authentication is accepted from sessionStorage only.
  // 2. A browser-session marker is created when the dashboard is opened.
  // 3. A fresh browser/window instance must not silently restore an old login.
  // 4. 30 minutes of inactivity logs the user out.
  // 5. The timer survives refreshes because the last-activity timestamp is
  //    kept in sessionStorage.
  // 6. When the page becomes visible again, the session is checked immediately.
  useEffect(() => {
    const TOKEN_KEY = 'token';
    const PROFILE_KEY = 'userProfile';
    const ROLE_KEY = 'activeDashboardRole';
    const LAST_ACTIVITY_KEY = 'stayguwahati_last_activity';
    const SESSION_ID_KEY = 'stayguwahati_browser_session';
    const SESSION_STARTED_KEY = 'stayguwahati_session_started';

    const token = sessionStorage.getItem(TOKEN_KEY);

    if (!token) {
      router.replace('/login');
      return;
    }

    // A session identifier exists only for this browser tab/session.
    // Do not copy authentication from localStorage.
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);

    if (!sessionId) {
      sessionId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
      sessionStorage.setItem(SESSION_STARTED_KEY, String(Date.now()));
    }

    const savedProfile = sessionStorage.getItem(PROFILE_KEY);

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setCurrentUser(parsed);
        setEditProfileName(parsed.name || '');
      } catch (e) {
        console.error(e);
      }
    }

    const savedRole =
      (sessionStorage.getItem(ROLE_KEY) as 'traveler' | 'host') || 'traveler';
    setCurrentRole(savedRole);

    const savedLang =
      (localStorage.getItem('preferredLanguage') as Language) || 'en';
    setCurrentLang(savedLang);

    const now = Date.now();
    const existingLastActivity = Number(
      sessionStorage.getItem(LAST_ACTIVITY_KEY) || '0'
    );

    if (
      !Number.isFinite(existingLastActivity) ||
      existingLastActivity <= 0
    ) {
      sessionStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    }

    const getLastActivity = () => {
      const value = Number(
        sessionStorage.getItem(LAST_ACTIVITY_KEY) || '0'
      );

      return Number.isFinite(value) && value > 0 ? value : Date.now();
    };

    const forceLogout = () => {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(PROFILE_KEY);
      sessionStorage.removeItem(ROLE_KEY);
      sessionStorage.removeItem(LAST_ACTIVITY_KEY);
      sessionStorage.removeItem(SESSION_ID_KEY);
      sessionStorage.removeItem(SESSION_STARTED_KEY);

      // Remove any legacy persistent authentication values.
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(ROLE_KEY);

      router.replace('/login');
    };

    let lastRecordedActivity = getLastActivity();

    const recordActivity = () => {
      if (!sessionStorage.getItem(TOKEN_KEY)) {
        forceLogout();
        return;
      }

      const currentTime = Date.now();

      // Throttle writes while still treating the user as active.
      if (currentTime - lastRecordedActivity >= 5000) {
        lastRecordedActivity = currentTime;
        sessionStorage.setItem(
          LAST_ACTIVITY_KEY,
          String(currentTime)
        );
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      'mousedown',
      'mousemove',
      'keydown',
      'touchstart',
      'touchmove',
      'scroll',
      'click',
      'pointerdown',
      'wheel',
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, recordActivity, {
        passive: true,
      });
    });

    // Detect tab/window lifecycle changes. If the page is restored after
    // being hidden for longer than the timeout, the session is terminated.
    const checkSession = () => {
      const currentToken = sessionStorage.getItem(TOKEN_KEY);

      if (!currentToken) {
        forceLogout();
        return;
      }

      if (Date.now() - getLastActivity() >= INACTIVITY_TIMEOUT_MS) {
        forceLogout();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };

    const handlePageShow = () => {
      checkSession();
    };

    const handleFocus = () => {
      checkSession();
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);

    const inactivityTimer = window.setInterval(
      checkSession,
      INACTIVITY_CHECK_INTERVAL_MS
    );

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, recordActivity);
      });

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);

      window.clearInterval(inactivityTimer);
    };
  }, [router]);

  // Unified Logout Handler
  const handleLogOut = () => {
    sessionStorage.clear();

    // Remove legacy persistent authentication data as well.
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('activeDashboardRole');

    router.replace('/login');
  };

  // Fetch traveler bookings
  const fetchTravelerBookings = async () => {
    setLoadingTraveler(true);
    try {
      const userEmail = (currentUser.email || '').toLowerCase().trim();
      const res = await fetch(`${BACKEND_URL}/api/bookings?email=${encodeURIComponent(userEmail)}`);
      let userBookings: Booking[] = [];

      if (res.ok) {
        const data = await res.json();
        const rawBookings: Booking[] = data.success && Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];

        userBookings = rawBookings.filter((b) => {
          const bEmail = (b.email || b.guestEmail || b.userEmail || '').toLowerCase().trim();
          return bEmail === userEmail;
        });
      }

      const today = new Date();
      const upcoming: Booking[] = [];
      const past: Booking[] = [];

      userBookings.forEach((b) => {
        const checkInDate = new Date(
          b.checkInDate || b.checkIn || (b.dates ? b.dates.split(' to ')[0] : null) || b.createdAt || ''
        );

        if (checkInDate >= today) {
          upcoming.push(b);
        } else {
          past.push(b);
        }
      });

      setUpcomingBookings(upcoming);
      setPastBookings(past);
    } catch (err) {
      console.error('Failed to load traveler bookings:', err);
    } finally {
      setLoadingTraveler(false);
    }
  };

  const normalizeEmail = (value: unknown) =>
    String(value || '').trim().toLowerCase();

  const getPropertyHostEmail = (property: Property) =>
    normalizeEmail(
      property.host?.email ||
      property.hostEmail ||
      property.ownerEmail ||
      property.userEmail
    );

  const getBookingPropertyId = (booking: Booking) =>
    String(
      booking.propertyId?._id ||
      booking.propertyId?.id ||
      booking.propertyId ||
      booking.homestayId?._id ||
      booking.homestayId?.id ||
      booking.homestayId ||
      booking.property?._id ||
      booking.property?.id ||
      booking.property ||
      ''
    );

  // Fetch Host Reservations
  const fetchHostReservations = async (propsList: Property[]) => {
    setLoadingReservations(true);

    try {
      const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('token') ||
        '';

      const res = await fetch(`${BACKEND_URL}/api/bookings`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      let allBookings: Booking[] = [];

      if (res.ok) {
        const data = await res.json();
        allBookings =
          data.success && Array.isArray(data.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];
      }

      const hostEmail = normalizeEmail(currentUser.email);
      const hostPropertyIds = new Set(
        propsList
          .map((p) => String(p._id || p.id || ''))
          .filter(Boolean)
      );

      const reservations = allBookings.filter((booking) => {
        const bookingPropertyId = getBookingPropertyId(booking);
        const bookingHostEmail = normalizeEmail(
          booking.hostEmail || booking.ownerEmail
        );

        return (
          (bookingPropertyId && hostPropertyIds.has(bookingPropertyId)) ||
          (bookingHostEmail && bookingHostEmail === hostEmail)
        );
      });

      // Keep the pipeline meaningful: show requested, confirmed,
      // completed and cancelled/rejected records, but exclude unrelated data.
      setHostReservations(
        reservations.sort((a, b) => {
          const aDate = new Date(a.checkInDate || a.checkIn || a.createdAt || '').getTime();
          const bDate = new Date(b.checkInDate || b.checkIn || b.createdAt || '').getTime();
          return bDate - aDate;
        })
      );

      // Income is based only on confirmed/completed stays.
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyEarnings = reservations.reduce((sum, booking) => {
        const status = normalizeEmail(booking.status);

        if (status !== 'confirmed' && status !== 'completed') {
          return sum;
        }

        const bookingDate = new Date(
          booking.checkInDate ||
          booking.checkIn ||
          booking.createdAt ||
          (booking.dates ? booking.dates.split(' to ')[0] : '')
        );

        const isThisMonth =
          !Number.isNaN(bookingDate.getTime()) &&
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear;

        const payout = Number(
          booking.totalPrice ||
          booking.payout ||
          booking.price ||
          0
        );

        return isThisMonth ? sum + payout : sum;
      }, 0);

      setMonthlyIncome(monthlyEarnings);
    } catch (err) {
      console.error('Failed to load host reservations:', err);
      setHostReservations([]);
      setMonthlyIncome(0);
    } finally {
      setLoadingReservations(false);
    }
  };

  // Fetch all properties owned by the logged-in host.
  // The backend defaults /api/properties to approved listings, so we query
  // all moderation states and then match the nested host.email locally.
  const fetchHostProperties = async () => {
    setLoadingHostProps(true);

    try {
      const hostEmail = normalizeEmail(currentUser.email);
      const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('token') ||
        '';

      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : undefined;

      const statuses = ['approved', 'pending', 'rejected'];

      const responses = await Promise.all(
        statuses.map((status) =>
          fetch(
            `${BACKEND_URL}/api/properties?status=${encodeURIComponent(status)}`,
            { headers }
          )
        )
      );

      const results = await Promise.all(
        responses.map(async (response) => {
          if (!response.ok) return [];
          const data = await response.json();
          return data.success && Array.isArray(data.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];
        })
      );

      const allProperties = results.flat();

      // De-duplicate in case the API returns duplicates.
      const uniqueProperties = Array.from(
        new Map(
          allProperties.map((property: Property) => [
            String(property._id || property.id),
            property,
          ])
        ).values()
      );

      const ownedProperties = uniqueProperties.filter(
        (property: Property) =>
          getPropertyHostEmail(property) === hostEmail
      );

      setHostProperties(ownedProperties);

      const ratedProperties = ownedProperties.filter(
        (property) => Number(property.rating) > 0
      );

      const averageRating = ratedProperties.length
        ? ratedProperties.reduce(
            (sum, property) => sum + Number(property.rating || 0),
            0
          ) / ratedProperties.length
        : 0;

      setHostRating(Number(averageRating.toFixed(1)));
      await fetchHostReservations(ownedProperties);
    } catch (err) {
      console.error('Failed to load host properties:', err);
      setHostProperties([]);
      setHostReservations([]);
      setMonthlyIncome(0);
    } finally {
      setLoadingHostProps(false);
    }
  };

  // Load Data based on Current Role
  useEffect(() => {
    if (!currentUser.email) return;

    if (currentRole === 'host') {
      fetchHostProperties();
    } else {
      fetchTravelerBookings();
    }
  }, [currentRole, currentUser.email]);

  // Mode Switch
  const toggleUserRole = () => {
    const nextRole = currentRole === 'traveler' ? 'host' : 'traveler';
    setCurrentRole(nextRole);
    sessionStorage.setItem('activeDashboardRole', nextRole);
  };

  // Language Switch
  const handleLangChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  // Save Profile
  const saveProfileChanges = () => {
    const newName = editProfileName.trim();
    if (newName) {
      const updated = { ...currentUser, name: newName };
      setCurrentUser(updated);
      sessionStorage.setItem('userProfile', JSON.stringify(updated));
      localStorage.setItem('userProfile', JSON.stringify(updated));
      alert('Profile updated successfully!');
    }
  };

  // Chat Polling
  const fetchHostMessages = async () => {
    if (!activeChat.guestName || !activeChat.propTitle) return;
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/messages?propertyTitle=${encodeURIComponent(
          activeChat.propTitle
        )}&guestName=${encodeURIComponent(activeChat.guestName)}`
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setChatMessages(result.data);
        }
      }
    } catch (err) {
      console.error('Error fetching modal messages:', err);
    }
  };

  // Auto scroll chat
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const openMessageModal = (guestName: string, propTitle: string, guestPhone: string) => {
    setActiveChat({
      guestName: guestName || 'Guest',
      propTitle: propTitle || 'Property',
      guestPhone: guestPhone || ''
    });
    setChatMessages([]);
    setIsMessageModalOpen(true);
  };

  useEffect(() => {
    if (isMessageModalOpen) {
      fetchHostMessages();
      if (chatPollInterval.current) clearInterval(chatPollInterval.current);
      chatPollInterval.current = setInterval(fetchHostMessages, 1500);
    } else {
      if (chatPollInterval.current) {
        clearInterval(chatPollInterval.current);
        chatPollInterval.current = null;
      }
    }

    return () => {
      if (chatPollInterval.current) clearInterval(chatPollInterval.current);
    };
  }, [isMessageModalOpen, activeChat]);

  const sendGuestMessage = async (e: FormEvent) => {
    e.preventDefault();
    const messageText = chatInputText.trim();
    if (!messageText) return;

    setChatInputText('');

    try {
      const token = sessionStorage.getItem('token');
      await fetch(`${BACKEND_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientPhone: activeChat.guestPhone,
          guestName: activeChat.guestName,
          propertyTitle: activeChat.propTitle,
          senderName: currentUser.name || currentUser.email || 'Host',
          message: messageText
        })
      });

      fetchHostMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const renderBookingCard = (b: Booking, statusText: string) => {
    const rawPhoto =
      b.image ||
      b.propertyImage ||
      b.propertyId?.image ||
      b.propertyId?.imageUrl ||
      (Array.isArray(b.propertyId?.images) ? b.propertyId.images[0] : null) ||
      (Array.isArray(b.propertyId?.photos) ? b.propertyId.photos[0] : null) ||
      b.homestayId?.image ||
      (Array.isArray(b.homestayId?.images) ? b.homestayId.images[0] : null) ||
      (Array.isArray(b.homestayId?.photos) ? b.homestayId.photos[0] : null) ||
      (Array.isArray(b.images) ? b.images[0] : null);

    const image = resolveImageUrl(rawPhoto);
    const title = b.propertyName || b.propertyId?.title || b.homestayId?.title || b.title || 'StayGuwahati Property';
    const location = b.location || b.propertyId?.location || b.homestayId?.location || 'Guwahati';
    const price = b.totalPrice || b.price || b.propertyId?.price || b.homestayId?.price || 0;
    const dates = b.dates || `${b.checkInDate || b.checkIn || ''} → ${b.checkOutDate || b.checkOut || ''}`;

    return (
      <div
        key={b._id || b.id || Math.random()}
        className="group bg-white border border-gray-200/80 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
      >
        <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250?text=No+Preview';
            }}
          />
          <span className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold rounded-full bg-white/95 backdrop-blur-md border border-gray-200/80 text-teal-800 shadow-sm">
            {statusText}
          </span>
        </div>

        <div className="p-5 flex flex-col flex-grow justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-teal-600 font-medium mb-1">
              <MapPin className="w-3 h-3 text-teal-600" />
              <span>{location}</span>
            </div>
            <h3 className="font-bold text-gray-900 text-base group-hover:text-teal-700 transition-colors line-clamp-1">
              {title}
            </h3>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{dates}</span>
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Total Paid</span>
              <span className="text-base font-extrabold text-teal-800">₹{price}</span>
            </div>

            <button
              onClick={() => setIsReceiptModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors group/btn"
            >
              <span>View Receipt</span>
              <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const userInitial = (currentUser.name || 'U')[0].toUpperCase();

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white shadow-xs border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
          {/* Logo & Mobile Avatar */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
              <span className="text-lg sm:text-xl font-bold text-teal-800">StayGuwahati</span>
            </Link>

            <div className="flex sm:hidden items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {userInitial}
              </div>
              <button
                onClick={handleLogOut}
                className="text-gray-400 hover:text-rose-600 text-sm p-1 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Language, Role Switcher & Desktop Avatar */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
            <select
              value={currentLang}
              onChange={(e) => handleLangChange(e.target.value as Language)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl p-2 focus:outline-none focus:border-teal-500 cursor-pointer transition shrink-0"
            >
              <option value="en">English</option>
              <option value="as">অসমীয়া (Assamese)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>

            <button
              onClick={toggleUserRole}
              className="bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold px-3 py-2 rounded-xl text-xs transition border border-teal-200 flex items-center gap-1.5 shrink-0"
            >
              {currentRole === 'traveler' ? (
                <>
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{t.switchHost}</span>
                </>
              ) : (
                <>
                  <Plane className="w-3.5 h-3.5" />
                  <span>{t.switchTraveler}</span>
                </>
              )}
            </button>

            <div className="hidden sm:block h-6 w-px bg-gray-200 my-auto ml-1" />

            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs">
                {userInitial}
              </div>
              <span className="text-xs font-bold text-gray-700">{currentUser.name || 'User'}</span>
              <button
                onClick={handleLogOut}
                className="text-gray-400 hover:text-rose-600 text-sm pl-1 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {t.welcome}, <span className="text-teal-700">{currentUser.name || 'User'}</span>!
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              {currentRole === 'host' ? t.subTextHost : t.subTextTraveler}
            </p>
          </div>

          {currentRole === 'host' && (
            <div className="w-full sm:w-auto">
              <Link
                href="/list-property"
                className="w-full sm:w-auto bg-slate-900 hover:bg-teal-600 text-white px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{t.listProp}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Traveler Section */}
        {currentRole === 'traveler' && (
          <section className="space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <Plane className="w-4 h-4 text-teal-600" /> {t.travelerHead}
            </h2>

            {/* Bookings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingTraveler ? (
                <p className="text-xs text-gray-400 col-span-full text-center py-6 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" /> Loading your bookings...
                </p>
              ) : upcomingBookings.length === 0 ? (
                <div className="col-span-full bg-white border border-gray-100 p-8 rounded-2xl text-center text-gray-400 text-xs shadow-sm">
                  <Plane className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>{t.noBookings}</p>
                </div>
              ) : (
                upcomingBookings.map((b) => renderBookingCard(b, t.upcoming))
              )}
            </div>

            {/* Wishlists */}
            <div className="mt-8 sm:mt-12 pt-4">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Heart className="w-4 h-4 text-rose-500" /> {t.wishlistHead}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-100 p-6 rounded-2xl text-center text-gray-400 text-xs shadow-sm col-span-full">
                  <p>{t.noWishlist}</p>
                </div>
              </div>
            </div>

            {/* Past Trips History */}
            <div className="mt-8 sm:mt-12 space-y-4 pt-2">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                <History className="w-4 h-4 text-gray-500" /> {t.historyHead}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastBookings.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl text-center text-gray-400 text-xs shadow-sm col-span-full">
                    <p>{t.noHistory}</p>
                  </div>
                ) : (
                  pastBookings.map((b) => renderBookingCard(b, t.completed))
                )}
              </div>
            </div>

            {/* Profile Credentials */}
            <div className="mt-8 sm:mt-12 bg-white border border-gray-100 p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                <IdCard className="w-4 h-4 text-teal-600" /> {t.profileHead}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">{t.labelName}</label>
                  <input
                    type="text"
                    value={editProfileName}
                    onChange={(e) => setEditProfileName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 focus:outline-teal-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">{t.labelEmail}</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full border border-gray-200 bg-gray-50 text-gray-400 rounded-xl p-2.5 cursor-not-allowed"
                  />
                </div>
              </div>
              <button
                onClick={saveProfileChanges}
                className="w-full sm:w-auto bg-slate-950 hover:bg-teal-600 text-white font-bold px-4 py-2.5 sm:py-2 rounded-xl text-xs transition"
              >
                {t.updateBtn}
              </button>
            </div>
          </section>
        )}

        {/* Host Section */}
        {currentRole === 'host' && (
          <section className="space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" /> {t.hostHead}
            </h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm text-center">
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">{t.incomeLabel}</p>
                <p className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  ₹{monthlyIncome.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm text-center">
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">{t.listingsLabel}</p>
                <p className="text-lg sm:text-xl font-black text-teal-600 mt-1">
                  {hostProperties.length} Properties
                </p>
              </div>
              <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm text-center">
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">{t.ratingLabel}</p>
                <p className="text-lg sm:text-xl font-black text-amber-500 mt-1 flex items-center justify-center gap-1">
                  {hostRating.toFixed(1)} <Star className="w-3 h-3 fill-amber-500" />
                </p>
              </div>
            </div>

            {/* Reservation Control Pipeline */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-teal-600" /> {t.pipelineHead}
              </h3>
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full min-w-[600px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-medium">
                      <th className="pb-3 font-semibold">{t.thG}</th>
                      <th className="pb-3 font-semibold">{t.thP}</th>
                      <th className="pb-3 font-semibold">{t.thD}</th>
                      <th className="pb-3 font-semibold">{t.thPay}</th>
                      <th className="pb-3 font-semibold">{t.thS}</th>
                      <th className="pb-3 font-semibold text-right">{t.thA}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {loadingReservations ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-xs text-gray-400">
                          <Loader2 className="w-4 h-4 animate-spin inline mr-1 text-teal-600" /> Loading pipeline...
                        </td>
                      </tr>
                    ) : hostReservations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-xs text-gray-400">
                          {t.noReservations}
                        </td>
                      </tr>
                    ) : (
                      hostReservations.map((r, i) => {
                        let rawName = '';
                        if (r.firstName || r.lastName) {
                          rawName = `${r.firstName || ''} ${r.lastName || ''}`.trim();
                        } else {
                          rawName =
                            r.guestName ||
                            r.userName ||
                            r.name ||
                            r.guest ||
                            (typeof r.propertyId === 'object' && r.propertyId?.name) ||
                            r.guestEmail ||
                            r.userEmail ||
                            '';
                        }

                        if (rawName && typeof rawName === 'string' && rawName.includes('@')) {
                          rawName = rawName.split('@')[0];
                        }

                        const formattedName = rawName || 'Valued Guest';
                        const propName = r.propertyName || r.propertyId?.title || r.title || 'Property';
                        const guestPhone = r.phone || r.guestPhone || r.recipientPhone || r.userPhone || '';

                        return (
                          <tr key={r._id || r.id || i} className="hover:bg-gray-50/55 transition">
                            <td className="py-3.5 font-bold text-gray-900">{formattedName}</td>
                            <td className="py-3.5 text-gray-600">{propName}</td>
                            <td className="py-3.5 text-gray-500">{r.dates || r.checkInDate || 'N/A'}</td>
                            <td className="py-3.5 font-black text-teal-700">
                              ₹{r.totalPrice || r.payout || r.price || 0}
                            </td>
                            <td className="py-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${String(r.status || '').toLowerCase() === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : String(r.status || '').toLowerCase() === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                {r.status || 'Requested'}
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              <div className="flex flex-wrap justify-end gap-2">
                                {String(r.status || 'Requested').toLowerCase() === 'requested' && (
                                  <>
                                    <button
                                      onClick={async () => {
                                        const token = sessionStorage.getItem('token') || '';
                                        if (!window.confirm(`Accept booking for ${formattedName}?`)) return;
                                        const res = await fetch(`${BACKEND_URL}/api/bookings/${r._id || r.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: 'Confirmed' }) });
                                        const data = await res.json();
                                        if (!res.ok || !data.success) { window.alert(data.message || 'Unable to accept booking.'); return; }
                                        await fetchHostReservations(hostProperties);
                                      }}
                                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-black text-white hover:bg-emerald-700"
                                    >✓ Accept</button>
                                    <button
                                      onClick={async () => {
                                        const token = sessionStorage.getItem('token') || '';
                                        if (!window.confirm(`Reject booking for ${formattedName}?`)) return;
                                        const res = await fetch(`${BACKEND_URL}/api/bookings/${r._id || r.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: 'Rejected' }) });
                                        const data = await res.json();
                                        if (!res.ok || !data.success) { window.alert(data.message || 'Unable to reject booking.'); return; }
                                        await fetchHostReservations(hostProperties);
                                      }}
                                      className="rounded-lg bg-red-50 px-3 py-1.5 text-[11px] font-black text-red-700 ring-1 ring-red-200 hover:bg-red-600 hover:text-white"
                                    >✕ Reject</button>
                                  </>
                                )}
                                <button
                                  onClick={() => openMessageModal(formattedName, propName, guestPhone)}
                                  className="bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-700 border border-teal-200 px-3 py-1 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5"
                                >
                                  <MessageSquare className="w-3 h-3" /> {t.msgBtn}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Listings */}
            <div className="pt-4">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <List className="w-4 h-4 text-gray-600" /> {t.activeListHead}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {loadingHostProps ? (
                  <p className="text-xs text-gray-400 col-span-3 text-center py-6 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" /> Loading properties...
                  </p>
                ) : hostProperties.length === 0 ? (
                  <div className="col-span-full bg-white border border-gray-100 p-8 rounded-2xl text-center text-gray-400 text-xs shadow-sm">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>{t.noProperties}</p>
                  </div>
                ) : (
                  hostProperties.map((p) => (
                    <div
                      key={p._id || p.id || Math.random()}
                      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col"
                    >
                      <div
                        className="h-40 bg-gray-200 bg-cover bg-center"
                        style={{
                          backgroundImage: `url('${resolveImageUrl(
                            p.images?.[0] || p.image || p.imageUrl || p.propertyImage
                          )}')`
                        }}
                      />
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">
                            {p.title || p.propertyName || 'Property'}
                          </h3>
                          <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-teal-600" />{' '}
                            {p.locality || p.location || p.city || p.address || 'Guwahati'}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-50">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              Price: <strong>₹{p.pricePerNight ?? p.price ?? 0} / night</strong>
                            </span>
                            <span className={`font-bold ${
                              String(p.status || '').toLowerCase() === 'approved'
                                ? 'text-emerald-600'
                                : String(p.status || '').toLowerCase() === 'pending'
                                  ? 'text-amber-600'
                                  : 'text-red-600'
                            }`}>
                              {p.status || 'Pending'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/property-details?id=${encodeURIComponent(String(p._id || p.id || ''))}`
                                )
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-teal-300 hover:text-teal-700"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/edit-property?id=${encodeURIComponent(String(p._id || p.id || ''))}`
                                )
                              }
                              className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-black text-white hover:bg-teal-700"
                            >
                              Edit Listing
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* Message Modal */}
        {isMessageModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 border border-gray-100 shadow-xl space-y-4 flex flex-col h-[480px] sm:h-[500px]">
              <div className="flex justify-between items-center border-b pb-3 border-gray-100">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    Chat with {activeChat.guestName}
                  </h3>
                  <p className="text-[10px] text-teal-600 font-semibold">{activeChat.propTitle}</p>
                </div>
                <button
                  onClick={() => setIsMessageModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div
                ref={chatHistoryRef}
                className="flex-1 overflow-y-auto space-y-3 p-2 bg-gray-50 rounded-xl text-xs border border-gray-100"
              >
                {chatMessages.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    Conversation started with {activeChat.guestName}.
                  </p>
                ) : (
                  chatMessages.map((msg, idx) => {
                    const currentSenderName = currentUser.name || currentUser.email || 'Host';
                    const isSelf = msg.senderName === currentSenderName || msg.senderName === 'Host';

                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex ${isSelf ? 'justify-end' : 'justify-start'} my-1.5`}
                      >
                        {isSelf ? (
                          <div className="bg-teal-600 text-white px-3 py-2 rounded-2xl rounded-tr-none max-w-[80%] shadow-xs">
                            <p className="text-xs font-medium break-words">{msg.message}</p>
                          </div>
                        ) : (
                          <div className="bg-white text-gray-800 border border-gray-200 px-3 py-2 rounded-2xl rounded-tl-none max-w-[80%] shadow-xs">
                            <p className="text-[10px] font-bold text-teal-700 mb-0.5">
                              {msg.senderName || activeChat.guestName}
                            </p>
                            <p className="text-xs font-medium break-words">{msg.message}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={sendGuestMessage} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-teal-500 font-medium"
                  required
                />
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-slate-900 text-white font-bold px-3.5 sm:px-4 py-2 rounded-xl text-xs transition flex items-center gap-1 shadow-sm"
                >
                  <span>Send</span> <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {isReceiptModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 border border-gray-100 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Booking Receipt</h3>
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs space-y-2 text-gray-600">
                <p>
                  <strong>Status:</strong> Confirmed & Paid
                </p>
                <p>
                  <strong>Platform:</strong> StayGuwahati Unified Core
                </p>
                <p className="text-teal-700 font-bold">Thank you for booking with StayGuwahati!</p>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 px-3 text-xs text-gray-400 border-t border-gray-100 bg-white mt-12">
        &copy; 2026 StayGuwahati Platform Unified Core Engine. All rights reserved.
      </footer>
    </div>
  );
}