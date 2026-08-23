'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const dictionary = {
  en: {
    title: 'List Your Homestay',
    sub: 'Fill out the details below to publish your property to our directory map.',
    lTitle: 'HOMESTAY TITLE',
    lDesc: 'DESCRIPTION',
    lLocality: 'LOCALITY (NEIGHBORHOOD)',
    lPrice: 'PRICE PER NIGHT (₹)',
    lBedrooms: 'NUMBER OF BEDROOMS',
    lAmenities: 'AMENITIES (WHAT THIS PLACE OFFERS)',
    lImages: 'PROPERTY IMAGES (EXACTLY 4)',
    lHostName: 'FULL NAME',
    lHostPhone: 'PHONE NUMBER',
    lHostPhoto: 'HOST PROFILE PHOTO',
    btn: 'Publish Listing',
    success: 'Property listed successfully and sent for verification!',
    footer: '© 2026 StayGuwahati Platform Unified Core Engine. All rights reserved.'
  },
  as: {
    title: 'আপোনাৰ হোমষ্টে তালিকাভুক্ত কৰক',
    sub: 'আমাৰ ডাইৰেক্টৰী মানচিত্ৰত আপোনাৰ সম্পত্তি প্ৰকাশ কৰিবলৈ তলৰ বিৱৰণসমূহ পূৰণ কৰক।',
    lTitle: 'হোমষ্টে শীৰ্ষক',
    lDesc: 'বিৱৰণ',
    lLocality: 'এলাকা',
    lPrice: 'প্ৰতি ৰাতিৰ মূল্য (₹)',
    lBedrooms: 'শোৱা কোঠা (Bedrooms)',
    lAmenities: 'সুবিধাসমূহ (এই স্থানত কি কি পোৱা যায়)',
    lImages: 'সম্পত্তিৰ ছবি (ঠিক ৪ খন)',
    lHostName: 'সম্পূৰ্ণ নাম',
    lHostPhone: 'ফোন নম্বৰ',
    lHostPhoto: 'হোষ্টৰ প্ৰফাইল ফটো',
    btn: 'তালিকা প্ৰকাশ কৰক',
    success: 'সম্পত্তি সফলতাৰে তালিকাভুক্ত কৰা হৈছে!',
    footer: '© ২০২৬ ষ্টেগুৱাহাটী প্লেটফৰ্ম ইউনিফাইড কোৰ ইঞ্জিন। সৰ্বস্বত্ব সংৰক্ষিত।'
  },
  hi: {
    title: 'अपनी होमस्टे सूचीबद्ध करें',
    sub: 'हमारे निर्देशिका मानचित्र पर अपनी संपत्ति प्रकाशित करने के लिए नीचे दिए गए विवरण भरें।',
    lTitle: 'होमस्टे शीर्षक',
    lDesc: 'विवरण',
    lLocality: 'स्थान',
    lPrice: 'प्रति रात्रि मूल्य (₹)',
    lBedrooms: 'बेडरूम की संख्या',
    lAmenities: 'सुविधाएं (इस स्थान पर क्या उपलब्ध है)',
    lImages: 'संपत्ति छवियां (ठीक 4)',
    lHostName: 'पूरा नाम',
    lHostPhone: 'फोन नंबर',
    lHostPhoto: 'होस्ट प्रोफाइल फ़ोटो',
    btn: 'लिस्टिंग प्रकाशित करें',
    success: 'संपत्ति सफलतापूर्वक सूचीबद्ध हो गई!',
    footer: '© 2026 स्टेगुवाहाटी प्लेटफॉर्म यूनिफाइड कोर इंजन। सर्वाधिकार सुरक्षित।'
  }
};

const localities = [
  'Amingaon', 'Azara', 'Bamunimaidam', 'Basistha', 'Beltola',
  'Bhangagarh', 'Borjhar', 'Chandmari', 'Christian Basti', 'Dispur',
  'Ganeshguri', 'Geetanagar', 'GS Road', 'Jalukbari', 'Kahilipara',
  'Kamakhya', 'Khanapara', 'Kharghuli', 'Lal Ganesh', 'Lokhra',
  'Maligaon', 'Narengi', 'Paltan Bazar', 'Pan Bazar', 'Rehabari',
  'Rukminigaon', 'Silpukhuri', 'Six Mile', 'Supermarket', 'Ulubari',
  'Uzan Bazar', 'Zoo Road'
];

const standardAmenities = [
  { id: 'wifi', label: 'Fast wifi', icon: '📶' },
  { id: 'tv', label: 'HDTV with Netflix', icon: '📺' },
  { id: 'parking', label: 'Free parking', icon: '🚗' },
  { id: 'pets', label: 'Pets allowed', icon: '🐶' },
  { id: 'ac', label: 'Air conditioning', icon: '❄️' },
  { id: 'kitchen', label: 'Kitchen access', icon: '🍳' },
];

export default function ListPropertyPage() {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState<'en' | 'as' | 'hi'>('en');
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locality, setLocality] = useState('');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  
  // Host Contact State
  const [hostName, setHostName] = useState('');
  const [hostPhone, setHostPhone] = useState('');
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [hostPhoto, setHostPhoto] = useState<string | null>(null);
  const [hostPhotoFile, setHostPhotoFile] = useState<File | null>(null);

  // Property Image Handling State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stayguwahati-backend.onrender.com';
  const t = dictionary[currentLang] || dictionary.en;

  // Dynamic fallback avatar using ui-avatars.com if no photo exists
  const generatedDefaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(hostName || 'Host')}&background=0d9488&color=fff&size=128`;

  useEffect(() => {
    const savedLang = (localStorage.getItem('preferredLanguage') as 'en' | 'as' | 'hi') || 'en';
    setCurrentLang(savedLang);

    try {
      const currentUser = JSON.parse(localStorage.getItem('userProfile') || '{}');
      if (currentUser.name) setHostName(currentUser.name);
      if (currentUser.email) setUserEmail(currentUser.email);
      if (currentUser.avatar || currentUser.photo || currentUser.image) {
        const rawProfileAvatar = currentUser.avatar || currentUser.photo || currentUser.image;
        setHostPhoto(rawProfileAvatar.startsWith('/') ? `${API_BASE_URL}${rawProfileAvatar}` : rawProfileAvatar);
      }
    } catch (e) {
      console.warn('Failed to parse user profile from localStorage:', e);
    }
  }, [API_BASE_URL]);

  // Cleanup Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as 'en' | 'as' | 'hi';
    setCurrentLang(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  const handleAmenityToggle = (label: string) => {
    if (selectedAmenities.includes(label)) {
      setSelectedAmenities(selectedAmenities.filter((item) => item !== label));
    } else {
      setSelectedAmenities([...selectedAmenities, label]);
    }
  };

  const handleHostPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (hostPhoto?.startsWith('blob:')) {
        URL.revokeObjectURL(hostPhoto);
      }
      setHostPhotoFile(file);
      setHostPhoto(URL.createObjectURL(file));
      e.target.value = '';
    }
  };

  const addPropertyImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length === 0) return;

    const remainingSlots = 4 - selectedFiles.length;

    if (remainingSlots <= 0) {
      setImageError('You already have exactly 4 images. Remove one before adding another.');
      e.target.value = '';
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    const newPreviewUrls = filesToAdd.map((file) => URL.createObjectURL(file));

    setSelectedFiles((current) => [...current, ...filesToAdd]);
    setPreviews((current) => [...current, ...newPreviewUrls]);

    const total = selectedFiles.length + filesToAdd.length;

    if (files.length > remainingSlots) {
      setImageError('Only 4 property images are allowed. Extra images were not added.');
    } else if (total < 4) {
      const remaining = 4 - total;
      setImageError(`Please add ${remaining} more image${remaining === 1 ? '' : 's'}.`);
    } else {
      setImageError(null);
    }

    e.target.value = '';
  };

  const removePropertyImage = (index: number) => {
    setSelectedFiles((current) => current.filter((_, i) => i !== index));

    setPreviews((current) => {
      const removed = current[index];
      if (removed) URL.revokeObjectURL(removed);
      return current.filter((_, i) => i !== index);
    });

    const remaining = 4 - (selectedFiles.length - 1);
    setImageError(
      `Please add ${remaining} more image${remaining === 1 ? '' : 's'}.`
    );
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(
        'Your browser does not support GPS location. Please enter the coordinates manually.'
      );
      return;
    }

    setLocationLoading(true);
    setLocationMessage('Getting your high-accuracy GPS location…');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLat = position.coords.latitude.toFixed(6);
        const nextLng = position.coords.longitude.toFixed(6);

        setLat(nextLat);
        setLng(nextLng);
        setLocationMessage(
          position.coords.accuracy
            ? `Location selected. Approximate GPS accuracy: ${Math.round(
                position.coords.accuracy
              )} metres.`
            : 'Location selected from your device GPS.'
        );
        setLocationLoading(false);
      },
      (error) => {
        let message =
          'Could not get your location. Please enter latitude and longitude manually.';

        if (error.code === error.PERMISSION_DENIED) {
          message =
            'Location permission was denied. Allow location access in your browser/phone settings and try again.';
        } else if (error.code === error.TIMEOUT) {
          message =
            'GPS timed out. Move outdoors or near a window and try again.';
        }

        setLocationMessage(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  const openLocationInMaps = () => {
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);

    if (
      !Number.isFinite(parsedLat) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      !Number.isFinite(parsedLng) ||
      parsedLng < -180 ||
      parsedLng > 180
    ) {
      alert('Please enter valid latitude and longitude first.');
      return;
    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${parsedLat},${parsedLng}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length !== 4) {
      setImageError('You must select exactly 4 images.');
      return;
    }

    const parsedLat = Number(lat);
    const parsedLng = Number(lng);

    if (
      !Number.isFinite(parsedLat) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      !Number.isFinite(parsedLng) ||
      parsedLng < -180 ||
      parsedLng > 180
    ) {
      alert('Please select or enter a valid property latitude and longitude.');
      return;
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Please enter a valid price per night.');
      return;
    }

    setSubmitting(true);

    try {
      let uploadedImageUrls: string[] = [];
      let uploadedHostAvatarUrl = '';

      // 1. Upload Host Profile Avatar if a new file was explicitly selected
      if (hostPhotoFile) {
        const avatarFormData = new FormData();
        avatarFormData.append('photos', hostPhotoFile);

        const avatarRes = await fetch(`${API_BASE_URL}/api/upload-images`, {
          method: 'POST',
          body: avatarFormData,
        });

        if (!avatarRes.ok) {
          throw new Error(`Host profile photo upload failed with status ${avatarRes.status}.`);
        }

        const avatarData = await avatarRes.json();
        const rawAvatarUrl = 
          avatarData.images?.[0] || 
          avatarData.urls?.[0] || 
          avatarData.url || 
          avatarData.image || 
          avatarData.filePath || 
          avatarData.file?.url || '';

        if (!rawAvatarUrl) {
          throw new Error('Host photo upload succeeded but returned no valid URL.');
        }

        uploadedHostAvatarUrl = rawAvatarUrl.startsWith('/') ? `${API_BASE_URL}${rawAvatarUrl}` : rawAvatarUrl;
      } else if (hostPhoto && !hostPhoto.startsWith('blob:') && !hostPhoto.startsWith('data:')) {
        // Use existing non-blob host photo URL if available
        uploadedHostAvatarUrl = hostPhoto;
      } else {
        // Fallback to generated initials avatar only if no photo was uploaded or provided
        uploadedHostAvatarUrl = generatedDefaultAvatar;
      }

      // 2. Upload Property Images to Backend Upload Endpoint
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append('photos', file));

      const uploadRes = await fetch(`${API_BASE_URL}/api/upload-images`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error(`Property image upload failed with status ${uploadRes.status}. Please ensure image server is online.`);
      }

      const uploadData = await uploadRes.json();
      if (uploadData.success && Array.isArray(uploadData.images)) {
        uploadedImageUrls = uploadData.images;
      } else if (Array.isArray(uploadData.urls)) {
        uploadedImageUrls = uploadData.urls;
      }

      if (uploadedImageUrls.length === 0) {
        throw new Error('Image upload succeeded but returned no valid URLs.');
      }

      // Ensure property image URLs are absolute
      uploadedImageUrls = uploadedImageUrls.map((imgUrl) => 
        imgUrl.startsWith('/') ? `${API_BASE_URL}${imgUrl}` : imgUrl
      );

      // 3. Construct clean property object matching backend schema rules
      const newProperty = {
        title: title.trim(),
        description: description.trim(),
        locality: locality,
        pricePerNight: parsedPrice,
        lat: isNaN(parsedLat) ? 26.1445 : parsedLat,
        lng: isNaN(parsedLng) ? 91.7362 : parsedLng,
        images: uploadedImageUrls,
        features: selectedAmenities,
        host: {
          name: hostName.trim(),
          email: userEmail.trim() || 'user@example.com',
          phone: hostPhone.trim(),
          avatar: uploadedHostAvatarUrl,
        },
        status: 'pending'
      };

      // 4. LocalStorage Backup
      try {
        const localProps = JSON.parse(localStorage.getItem('userProperties') || '[]');
        localProps.push(newProperty);
        localStorage.setItem('userProperties', JSON.stringify(localProps));
      } catch (storageError) {
        console.warn('LocalStorage backup skipped:', storageError);
      }

      // 5. Post Listing JSON to backend API
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/api/homestays`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newProperty)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let detailMsg = errorData.message || errorData.error || `Server responded with status ${response.status}`;
        
        if (Array.isArray(errorData.errors)) {
          detailMsg += `: ${errorData.errors.map((e: any) => e.message || e.msg || JSON.stringify(e)).join(', ')}`;
        } else if (typeof errorData.errors === 'object' && errorData.errors !== null) {
          detailMsg += `: ${JSON.stringify(errorData.errors)}`;
        }
        
        throw new Error(detailMsg);
      }

      alert(t.success);
      router.replace('/dashboard');
    } catch (error: any) {
      console.error('Error submitting listing:', error);
      alert(`Submission failed: ${error.message || 'Server error. Please check your network connection.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-16 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-0">
          <div
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0"
            onClick={() => router.push('/')}
          >
            <span className="text-xl sm:text-2xl">🏠</span>
            <span className="text-lg sm:text-xl font-bold text-teal-800">StayGuwahati</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            <select
              value={currentLang}
              onChange={handleLangChange}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl p-1.5 focus:outline-none focus:border-teal-500 cursor-pointer transition"
            >
              <option value="en">English</option>
              <option value="as">অসমীয়া (Assamese)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3 py-1.5 rounded-xl text-xs transition"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t.title}</h1>
            <p className="text-gray-400 text-xs mt-1">{t.sub}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 font-medium mb-1">{t.lTitle}</label>
              <input
                type="text"
                required
                placeholder="e.g., Cozy Riverside Orchid Villa"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 focus:outline-teal-500 font-medium text-gray-900"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-medium mb-1">{t.lDesc}</label>
              <textarea
                rows={3}
                required
                placeholder="Describe the ambiance, amenities, and unique features..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 focus:outline-teal-500 font-medium text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-medium mb-1">{t.lLocality}</label>
                <select
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-teal-500 font-medium bg-white text-gray-900"
                >
                  <option value="" disabled>Select locality...</option>
                  {localities.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">{t.lPrice}</label>
                <input
                  type="number"
                  required
                  placeholder="2500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-teal-500 font-medium text-gray-900"
                />
              </div>
            </div>

            {/* Bedroom Selector Block */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <label className="block text-gray-700 font-bold text-sm">{t.lBedrooms}</label>
                <p className="text-gray-400 text-xs">Select how many bedrooms are available for guests.</p>
              </div>

              <div className="flex items-center gap-3 bg-white p-1.5 border border-gray-200 rounded-xl shadow-sm">
                <button
                  type="button"
                  onClick={() => setBedrooms((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold flex items-center justify-center text-sm transition"
                >
                  −
                </button>
                <div className="text-center min-w-[3rem]">
                  <span className="text-base font-extrabold text-gray-900">{bedrooms}</span>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Bedrooms</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBedrooms((prev) => Math.min(10, prev + 1))}
                  className="w-8 h-8 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Amenities Selection */}
            <div>
              <label className="block text-gray-400 font-medium mb-2 uppercase tracking-wide">
                {t.lAmenities}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {standardAmenities.map((item) => {
                  const isChecked = selectedAmenities.includes(item.label);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAmenityToggle(item.label)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left transition font-medium cursor-pointer ${
                        isChecked
                          ? 'border-teal-600 bg-teal-50/60 text-teal-900 shadow-sm'
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-xs truncate">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="ml-auto text-teal-600 rounded focus:ring-teal-500 h-3.5 w-3.5"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Image Upload Area */}
            <div>
              <label className="block text-gray-400 font-medium mb-1 uppercase tracking-wide">
                {t.lImages}
              </label>

              <div className={`rounded-2xl p-4 sm:p-5 transition ${
                imageError
                  ? 'border-2 border-rose-300 bg-rose-50/30'
                  : 'border-2 border-dashed border-teal-200 bg-teal-50/30'
              }`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 cursor-pointer transition shadow-sm">
                    🖼️ <span>Choose from phone</span>
                    <input
                      type="file"
                      multiple
                      accept="image/png, image/jpeg, image/webp"
                      onChange={addPropertyImages}
                      className="hidden"
                    />
                  </label>

                  <label className="flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-teal-50 text-teal-800 font-bold py-3 px-4 cursor-pointer transition border border-teal-200 shadow-sm">
                    📷 <span>Take photo with camera</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={addPropertyImages}
                      className="hidden"
                    />
                  </label>
                </div>

                <p className="text-center text-gray-400 text-xs mt-3">
                  Add exactly 4 property photos. On mobile, the camera button opens the rear camera.
                  Take one photo and repeat until all 4 are added.
                </p>

                {previews.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                    {previews.map((src, idx) => (
                      <div
                        key={`${src}-${idx}`}
                        className="relative h-28 sm:h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white"
                      >
                        <img
                          src={src}
                          alt={`Property preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {idx === 0 && (
                          <span className="absolute left-1.5 top-1.5 bg-slate-900/80 text-white text-[9px] font-bold rounded-full px-2 py-1">
                            COVER
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => removePropertyImage(idx)}
                          className="absolute right-1.5 top-1.5 w-7 h-7 rounded-full bg-red-600 text-white font-bold shadow flex items-center justify-center"
                          aria-label={`Remove property image ${idx + 1}`}
                        >
                          ×
                        </button>

                        <span className="absolute bottom-1.5 left-1.5 bg-white/90 text-gray-700 text-[9px] font-bold rounded px-1.5 py-0.5">
                          {idx + 1}/4
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 text-center">
                    <div className="w-14 h-14 mx-auto rounded-full bg-teal-100 flex items-center justify-center text-2xl">
                      📷
                    </div>
                    <p className="font-bold text-gray-800 text-sm mt-2">
                      Add your 4 property photos
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Bedroom, living area, exterior and bathroom photos are recommended.
                    </p>
                  </div>
                )}
              </div>

              {imageError && (
                <p className="text-rose-500 text-xs mt-1.5 font-semibold">
                  ⚠️ {imageError}
                </p>
              )}

              {selectedFiles.length > 0 && !imageError && (
                <p className="text-teal-600 text-xs mt-1.5 font-semibold">
                  ✓ {selectedFiles.length}/4 image(s) selected
                </p>
              )}
            </div>

            {/* Exact Property Location */}
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-lg shrink-0">
                  📍
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">EXACT PROPERTY LOCATION</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Stand at the property and use your phone GPS to automatically select its coordinates.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locationLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {locationLoading ? '⏳ Getting GPS location…' : '📍 Use my current location'}
              </button>

              {locationMessage && (
                <div className="mt-3 rounded-xl bg-teal-50 border border-teal-100 px-3 py-2.5 text-xs font-semibold text-teal-800">
                  {locationMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">
                    LATITUDE COORDINATE
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.000001"
                    min="-90"
                    max="90"
                    required
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="e.g. 26.144500"
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-teal-500 font-medium text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">
                    LONGITUDE COORDINATE
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.000001"
                    min="-180"
                    max="180"
                    required
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="e.g. 91.736200"
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-teal-500 font-medium text-gray-900 bg-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={openLocationInMaps}
                className="w-full mt-3 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl border border-gray-200 transition text-xs"
              >
                🗺️ Verify this location on Google Maps
              </button>

              <p className="text-gray-400 text-[11px] leading-5 mt-3">
                GPS accuracy depends on the phone and surroundings. You can manually adjust the
                coordinates before publishing if required.
              </p>
            </div>

            {/* Host Profile Section */}
            <div className="pt-4 border-t border-gray-100">
              <p className="font-bold text-gray-900 mb-3">🛡️ Host Information</p>
              
              {/* Host Photo Upload UI */}
              <div className="mb-4 flex items-center gap-4 p-3 border border-gray-100 bg-slate-50/50 rounded-2xl">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
                  <img 
                    src={hostPhoto || generatedDefaultAvatar} 
                    alt="Host Avatar" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-bold mb-0.5">{t.lHostPhoto}</label>
                  <p className="text-gray-400 text-[11px] mb-2">Upload a photo, or we will automatically generate an initial avatar from your name.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md">
                    <label className="flex items-center justify-center gap-1.5 bg-white hover:bg-gray-100 text-teal-800 font-semibold px-3 py-2 rounded-xl border border-gray-200 text-xs cursor-pointer shadow-sm transition">
                      🖼️ Choose from device
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleHostPhotoChange}
                        className="hidden"
                      />
                    </label>

                    <label className="flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-3 py-2 rounded-xl border border-teal-600 text-xs cursor-pointer shadow-sm transition">
                      📷 Take photo with camera
                      <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={handleHostPhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <p className="text-gray-400 text-[10px] mt-2">
                    On mobile, the camera option opens the front camera. On laptops/desktops,
                    your browser may ask for camera permission or use the available camera.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">{t.lHostName}</label>
                  <input
                    type="text"
                    required
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-teal-500 font-medium text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">{t.lHostPhone}</label>
                  <input
                    type="text"
                    required
                    placeholder="10-digit mobile number"
                    value={hostPhone}
                    onChange={(e) => setHostPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-teal-500 font-medium text-gray-900"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-600 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition shadow-sm mt-4 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              ☁️ {submitting ? 'Processing...' : t.btn}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-100 bg-white mt-12">
        {t.footer}
      </footer>
    </div>
  );
}