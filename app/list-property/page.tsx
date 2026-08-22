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
    lImages: 'PROPERTY IMAGES UPLOAD (EXACTLY 4)',
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
    lImages: 'সম্পত্তিৰ ছবি আপলোড কৰক (ঠিক ৪ খন)',
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
    lImages: 'संपत्ति छवि अपलोड (ठीक 4)',
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
  const [lat, setLat] = useState('26.1445');
  const [lng, setLng] = useState('91.7362');
  
  // Host Contact State
  const [hostName, setHostName] = useState('');
  const [hostPhone, setHostPhone] = useState('');
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [hostPhoto, setHostPhoto] = useState<string | null>(null);

  // Property Image Handling State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stayguwahati-backend.onrender.com';
  const t = dictionary[currentLang] || dictionary.en;

  useEffect(() => {
    const savedLang = (localStorage.getItem('preferredLanguage') as 'en' | 'as' | 'hi') || 'en';
    setCurrentLang(savedLang);

    try {
      const currentUser = JSON.parse(localStorage.getItem('userProfile') || '{}');
      if (currentUser.name) setHostName(currentUser.name);
      if (currentUser.email) setUserEmail(currentUser.email);
      if (currentUser.avatar || currentUser.photo || currentUser.image) {
        setHostPhoto(currentUser.avatar || currentUser.photo || currentUser.image);
      }
    } catch (e) {
      console.warn('Failed to parse user profile from localStorage:', e);
    }
  }, []);

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
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setHostPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);

    if (files.length === 0) {
      setPreviews([]);
      setImageError(null);
      return;
    }

    if (files.length !== 4) {
      setImageError(`You must select exactly 4 images (currently selected: ${files.length}).`);
    } else {
      setImageError(null);
    }

    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const convertFilesToBase64 = (files: File[]): Promise<string[]> => {
    return Promise.all(
      files.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length !== 4) {
      setImageError('You must select exactly 4 images.');
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

      // 1. Attempt Multipart Upload to API endpoint
      try {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('photos', file));

        const uploadRes = await fetch(`${API_BASE_URL}/api/upload-images`, {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.success && Array.isArray(uploadData.images)) {
            uploadedImageUrls = uploadData.images;
          } else if (Array.isArray(uploadData.urls)) {
            uploadedImageUrls = uploadData.urls;
          }
        }
      } catch (uploadErr) {
        console.warn('Image upload endpoint unavailable, falling back to base64 encoding.');
      }

      // 2. Fallback to base64 encoding if backend upload endpoint is offline
      if (uploadedImageUrls.length === 0) {
        uploadedImageUrls = await convertFilesToBase64(selectedFiles);
      }

      const avatarValue = hostPhoto || '';
      const parsedLat = Number(lat);
      const parsedLng = Number(lng);

      // 3. Construct clean property object
      const newProperty = {
        title: title.trim(),
        description: description.trim(),
        locality,
        location: locality,
        pricePerNight: parsedPrice,
        price: parsedPrice,
        bedrooms: Number(bedrooms) || 1,
        features: selectedAmenities,
        amenities: selectedAmenities,
        images: uploadedImageUrls,
        photos: uploadedImageUrls,
        imageUrl: uploadedImageUrls[0] || '',
        lat: isNaN(parsedLat) ? 26.1445 : parsedLat,
        lng: isNaN(parsedLng) ? 91.7362 : parsedLng,
        hostName: hostName.trim(),
        hostPhone: hostPhone.trim(),
        hostAvatar: avatarValue,
        hostImage: avatarValue,
        host: {
          name: hostName.trim(),
          email: userEmail.trim() || 'user@example.com',
          phone: hostPhone.trim(),
          avatar: avatarValue,
          image: avatarValue,
          photo: avatarValue,
        },
        status: 'pending',
        isApproved: false,
      };

      // 4. Safely save to LocalStorage (strip heavy Base64 data to avoid QuotaExceededError)
      try {
        const localProps = JSON.parse(localStorage.getItem('userProperties') || '[]');
        
        const safePropertyForStorage = {
          ...newProperty,
          images: newProperty.images.map(img => img.startsWith('data:') ? '' : img),
          photos: newProperty.photos.map(img => img.startsWith('data:') ? '' : img),
          imageUrl: newProperty.imageUrl.startsWith('data:') ? '' : newProperty.imageUrl,
          hostAvatar: avatarValue.startsWith('data:') ? '' : avatarValue,
          hostImage: avatarValue.startsWith('data:') ? '' : avatarValue,
          host: {
            ...newProperty.host,
            avatar: avatarValue.startsWith('data:') ? '' : avatarValue,
            image: avatarValue.startsWith('data:') ? '' : avatarValue,
            photo: avatarValue.startsWith('data:') ? '' : avatarValue,
          }
        };

        localProps.push(safePropertyForStorage);
        localStorage.setItem('userProperties', JSON.stringify(localProps));
      } catch (storageError) {
        console.warn('LocalStorage quota exceeded or full. Skipping local backup:', storageError);
      }

      // 5. Post listing to backend API with auth headers & explicit error parsing
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

              <div className="flex items-center gap-3 bg-white p-1.5 border border-gray-200 rounded-xl shadow-xs">
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
                          ? 'border-teal-600 bg-teal-50/60 text-teal-900 shadow-xs'
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

              <div className={`relative border-2 border-dashed rounded-2xl p-6 transition text-center group cursor-pointer ${
                imageError ? 'border-rose-300 bg-rose-50/30' : 'border-teal-200 hover:border-teal-500 bg-teal-50/30 hover:bg-teal-50/60'
              }`}>
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xl">
                    📷
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      <span className="text-teal-600 underline decoration-teal-300 underline-offset-2">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">PNG, JPG or WEBP (Exactly 4 images required)</p>
                  </div>
                </div>
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative h-16 rounded-xl overflow-hidden border border-gray-200 shadow-xs">
                      <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {imageError && (
                <p className="text-rose-500 text-xs mt-1.5 font-semibold">
                  ⚠️ {imageError}
                </p>
              )}

              {selectedFiles.length > 0 && !imageError && (
                <p className="text-teal-600 text-xs mt-1.5 font-semibold">
                  {selectedFiles.length} image(s) selected
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-medium mb-1">LATITUDE COORDINATE</label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-teal-500 font-medium text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-medium mb-1">LONGITUDE COORDINATE</label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-teal-500 font-medium text-gray-900"
                />
              </div>
            </div>

            {/* Host Profile Section */}
            <div className="pt-4 border-t border-gray-100">
              <p className="font-bold text-gray-900 mb-3">🛡️ Host Information</p>
              
              {/* Host Photo Upload UI */}
              <div className="mb-4 flex items-center gap-4 p-3 border border-gray-100 bg-slate-50/50 rounded-2xl">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 shrink-0 border-2 border-white shadow-sm flex items-center justify-center text-gray-400">
                  {hostPhoto ? (
                    <img src={hostPhoto} alt="Host Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-bold mb-0.5">{t.lHostPhoto}</label>
                  <p className="text-gray-400 text-[11px] mb-2">Upload a clear photo of yourself to display on your listing badge.</p>
                  <label className="inline-block bg-white hover:bg-gray-100 text-teal-800 font-semibold px-3 py-1.5 rounded-xl border border-gray-200 text-xs cursor-pointer shadow-2xs transition">
                    Choose Photo
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleHostPhotoChange}
                      className="hidden"
                    />
                  </label>
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