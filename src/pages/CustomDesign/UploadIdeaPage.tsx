/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  UploadCloud,
  X,
  CheckCircle2,
  CalendarCheck,
  FileText,
  ArrowRight,
  ShieldAlert,
  Camera,
  Ruler,
  FolderPlus,
  File,
  Sparkles,
  TreePine,
  Layers,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useProjectStore } from '../../store/useProjectStore';
import { submitCustomIdeaRequest, CustomIdeaSubmission } from '../../services/firebase/firestore';
import { uploadCustomDesignFile, UploadedAttachment } from '../../services/firebase/storage';

const TIMBER_OPTIONS = [
  'Artisan Recommendation / Best Suited',
  'CP Teak (Central Province)',
  'Solid Indian Rosewood (Sheesham)',
  'Solid American Walnut',
  'Solid European White Oak',
  'Seasoned Acacia Wood',
];

export const UploadIdeaPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillTitle = searchParams.get('title') || '';
  const prefillProject = searchParams.get('project') || '';

  const { user } = useAuthStore();
  const { projects } = useProjectStore();

  // Form states
  const [itemType, setItemType] = useState('sofa');
  const [selectedProjectId, setSelectedProjectId] = useState(prefillProject || projects[0]?.projectId || '');
  const [timberPreference, setTimberPreference] = useState(TIMBER_OPTIONS[0]);
  const [roomDimensions, setRoomDimensions] = useState('');
  const [description, setDescription] = useState(prefillTitle ? `Custom variation based on ${prefillTitle}` : '');
  const [estimatedBudget, setEstimatedBudget] = useState('₹40,000 – ₹80,000');
  const [requestType, setRequestType] = useState<'quote' | 'book_visit' | 'both'>('quote');
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [visitAddress, setVisitAddress] = useState('');
  const [preferredVisitDate, setPreferredVisitDate] = useState('');

  // Drag and drop & Multi-file state
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<Array<{ name: string; url: string; isPdf: boolean; size: number }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedReq, setSubmittedReq] = useState<CustomIdeaSubmission | null>(null);

  const handleFilesAdded = (newFiles: FileList | File[]) => {
    setErrorMsg('');
    const validList: File[] = [];
    const previews: Array<{ name: string; url: string; isPdf: boolean; size: number }> = [];

    Array.from(newFiles).forEach((file) => {
      const isImg = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isPdf = file.type === 'application/pdf';

      if (!isImg && !isPdf) {
        setErrorMsg('Please upload photos (JPG, PNG, WebP) or PDF architectural plans.');
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg(`File ${file.name} exceeds 15MB. Please upload a smaller document.`);
        return;
      }

      validList.push(file);
      previews.push({
        name: file.name,
        url: isImg ? URL.createObjectURL(file) : '',
        isPdf,
        size: file.size,
      });
    });

    setFilesToUpload((prev) => [...prev, ...validList]);
    setFilePreviews((prev) => [...prev, ...previews]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (filesToUpload.length === 0) {
      setErrorMsg('Please upload at least one photo or architectural plan of your furniture idea.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Please enter your phone number so our workshop team can contact you.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const userId = user?.uid || `guest_${Date.now()}`;
      const uploadedAttachments: UploadedAttachment[] = [];

      // Upload each file via storage service
      for (const file of filesToUpload) {
        const res = await uploadCustomDesignFile(file, userId);
        uploadedAttachments.push(res);
      }

      const primaryImage =
        uploadedAttachments.find((a) => a.type.startsWith('image/'))?.url ||
        uploadedAttachments[0]?.url ||
        '';

      const reqId = `IDEA-${Date.now().toString().slice(-6)}`;
      const submission: CustomIdeaSubmission = {
        requestId: reqId,
        userId,
        customerName: customerName.trim() || 'Valued Client',
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || 'client@charbhuja.com',
        itemType,
        description: description.trim() || `Custom ${itemType} idea from uploaded files`,
        estimatedBudget,
        imageUrl: primaryImage,
        projectId: selectedProjectId || undefined,
        timberPreference,
        roomDimensions: roomDimensions.trim() || undefined,
        attachments: uploadedAttachments,
        requestType,
        visitAddress: requestType !== 'quote' ? visitAddress : undefined,
        preferredVisitDate: requestType !== 'quote' ? preferredVisitDate : undefined,
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await submitCustomIdeaRequest(submission);
      setSubmittedReq(submission);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || 'Failed to submit idea. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // SUCCESS CONFIRMATION
  if (submittedReq) {
    return (
      <div className="bg-[#F8F6F2] min-h-screen py-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-[#E7E1D9] p-8 sm:p-12 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto border border-green-200 shadow-2xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#68452D]">
                Custom Idea Registered
              </span>
              <h1 className="font-serif text-3xl font-bold text-[#29231E] mt-1">
                Reference #{submittedReq.requestId}
              </h1>
              <p className="text-sm text-[#77716A] mt-2 leading-relaxed">
                Thank you, <strong>{submittedReq.customerName}</strong>! We have received your {submittedReq.itemType} reference files.
                {submittedReq.requestType === 'quote' &&
                  ' Our senior carpenters will evaluate the timber joinery and send an itemized quotation within 24 hours.'}
                {submittedReq.requestType === 'book_visit' &&
                  ' Our team will call you to confirm your in-home measurement visit.'}
                {submittedReq.requestType === 'both' &&
                  ' We will prepare an estimated quote and coordinate your home measurement visit.'}
              </p>
            </div>

            {/* Attached previews */}
            {submittedReq.attachments && submittedReq.attachments.length > 0 && (
              <div className="p-4 bg-[#F8F6F2] rounded-2xl border border-[#E7E1D9] text-left text-xs space-y-2">
                <span className="font-bold uppercase tracking-wider text-[#77716A] block text-[10px]">
                  Uploaded Reference Documents ({submittedReq.attachments.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {submittedReq.attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-[#E7E1D9] text-[#29231E]">
                      {att.type === 'application/pdf' ? <FileText className="w-3.5 h-3.5 text-red-600" /> : <Camera className="w-3.5 h-3.5 text-[#68452D]" />}
                      <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/account"
                className="px-6 py-3 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-colors shadow-2xs"
              >
                Track Status in My Account
              </Link>
              {submittedReq.projectId && (
                <Link
                  to={`/projects?id=${submittedReq.projectId}`}
                  className="px-6 py-3 bg-white border border-[#E7E1D9] text-[#29231E] rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#F0ECE5] transition-colors"
                >
                  View in Project Room
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Editorial Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F0ECE5] border border-[#E7E1D9] text-xs font-semibold uppercase tracking-wider text-[#68452D]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Custom Furniture On Demand · Rajasthan Workshop</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#29231E]">
            Bring Your Furniture Idea to Life
          </h1>
          <p className="text-sm text-[#77716A] leading-relaxed">
            Saw a sofa, wardrobe, or dining suite you love on Pinterest or Instagram? Upload the photo or floor plan. Our master carpenters will manufacture it to your exact room size.
          </p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E7E1D9] p-8 sm:p-10 shadow-sm space-y-8">
          {/* STEP 1: DRAG & DROP PHOTO OR PDF */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block">
                1. Upload Idea Photos or Architectural Plans *
              </label>
              <span className="text-[11px] text-[#77716A]">Images (JPG, PNG) or PDFs up to 15MB</span>
            </div>

            {/* Drag & Drop Surface */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer group ${
                isDragging
                  ? 'border-[#68452D] bg-[#F0ECE5] scale-101 ring-4 ring-[#68452D]/10'
                  : 'border-[#E7E1D9] hover:border-[#68452D] bg-[#F8F6F2]'
              }`}
            >
              <input
                type="file"
                id="multiIdeaUpload"
                multiple
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
                className="hidden"
              />
              <label htmlFor="multiIdeaUpload" className="cursor-pointer flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#E7E1D9] flex items-center justify-center text-[#68452D] group-hover:scale-105 transition-transform mb-3 shadow-2xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <span className="text-sm font-semibold text-[#29231E]">
                  Drag and drop your photos or floor plans here
                </span>
                <span className="text-xs text-[#77716A] mt-1">
                  or <span className="text-[#68452D] underline font-medium">browse files</span> on your device
                </span>
              </label>
            </div>

            {/* File previews strip */}
            {filePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {filePreviews.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-2xl overflow-hidden border border-[#E7E1D9] bg-[#F8F6F2] p-2 flex flex-col justify-between group shadow-2xs aspect-square"
                  >
                    {item.isPdf ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-red-600">
                        <FileText className="w-8 h-8 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">PDF Drawing</span>
                      </div>
                    ) : (
                      <img src={item.url} alt="Upload preview" className="w-full h-full object-cover rounded-xl" />
                    )}

                    <div className="absolute inset-x-2 bottom-2 bg-black/70 backdrop-blur-xs text-white p-1 rounded-lg text-[10px] truncate text-center">
                      {item.name}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm opacity-90 hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STEP 2: LINK TO PROJECT ROOM */}
          <div className="p-4 bg-[#F8F6F2] rounded-2xl border border-[#E7E1D9] space-y-2">
            <div className="flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-[#68452D]" />
              <label className="text-xs font-bold uppercase tracking-wider text-[#29231E]">
                2. Link to a Room Project Collection (Optional)
              </label>
            </div>
            <p className="text-xs text-[#77716A]">
              Group this custom design into one of your existing room folders:
            </p>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-white border border-[#E7E1D9] rounded-xl px-3.5 py-2.5 text-xs text-[#29231E] focus:outline-none"
            >
              <option value="">No Project (Stand-alone Quotation)</option>
              {projects.map((proj) => (
                <option key={proj.projectId} value={proj.projectId}>
                  {proj.name} ({proj.roomType || 'Room'})
                </option>
              ))}
            </select>
          </div>

          {/* STEP 3: PIECE SPECS & TIMBER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                3. Furniture Type *
              </label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none focus:border-[#68452D]"
              >
                <option value="sofa">Sofa / Sectional Couch</option>
                <option value="wardrobe">Wardrobe / Walk-in Closet</option>
                <option value="dining">Dining Table & Chairs</option>
                <option value="bed">Bed & Headboard</option>
                <option value="kitchen">Modular Kitchen</option>
                <option value="tvunit">TV Unit / Media Console</option>
                <option value="chairs">Chairs & Armchairs</option>
                <option value="other">Other Bespoke Woodwork</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                4. Timber / Primary Material
              </label>
              <select
                value={timberPreference}
                onChange={(e) => setTimberPreference(e.target.value)}
                className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none focus:border-[#68452D]"
              >
                {TIMBER_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP 4: ROOM MEASUREMENTS & BUDGET */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                5. Room / Wall Dimensions (Optional)
              </label>
              <div className="relative">
                <Ruler className="w-4 h-4 text-[#77716A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={roomDimensions}
                  onChange={(e) => setRoomDimensions(e.target.value)}
                  placeholder="e.g. 7 ft wide wall, or 3m × 2.4m"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl text-xs text-[#29231E] focus:outline-none focus:border-[#68452D]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                6. Estimated Budget Target
              </label>
              <select
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
                className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none focus:border-[#68452D]"
              >
                <option value="Under ₹35,000">Under ₹35,000</option>
                <option value="₹35,000 – ₹70,000">₹35,000 – ₹70,000</option>
                <option value="₹70,000 – ₹1,50,000">₹70,000 – ₹1,50,000</option>
                <option value="₹1,50,000+ (Full Suite / Premium)">₹1,50,000+ (Full Suite / Premium)</option>
              </select>
            </div>
          </div>

          {/* STEP 5: DESCRIPTION */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
              7. Craft Notes / Specific Requests
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Want high-density 40D foam, natural beige linen fabric, concealed storage drawers under bed, or fluted detail on wardrobe shutters..."
              className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl p-3.5 text-xs text-[#29231E] focus:outline-none focus:border-[#68452D]"
            />
          </div>

          {/* STEP 6: PROCEED SELECTION */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block">
              8. How Would You Like to Proceed?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRequestType('quote')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  requestType === 'quote'
                    ? 'border-[#68452D] bg-[#F0ECE5] ring-1 ring-[#68452D]'
                    : 'border-[#E7E1D9] bg-[#F8F6F2] hover:border-[#68452D]'
                }`}
              >
                <FileText className="w-5 h-5 text-[#68452D] mb-2" />
                <h4 className="text-xs font-bold text-[#29231E]">Estimated Quote</h4>
                <p className="text-[11px] text-[#77716A] mt-0.5">Free online proposal with timber specs</p>
              </button>

              <button
                type="button"
                onClick={() => setRequestType('book_visit')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  requestType === 'book_visit'
                    ? 'border-[#68452D] bg-[#F0ECE5] ring-1 ring-[#68452D]'
                    : 'border-[#E7E1D9] bg-[#F8F6F2] hover:border-[#68452D]'
                }`}
              >
                <Ruler className="w-5 h-5 text-[#68452D] mb-2" />
                <h4 className="text-xs font-bold text-[#29231E]">Book Free Visit</h4>
                <p className="text-[11px] text-[#77716A] mt-0.5">Carpenter visits with timber samples</p>
              </button>

              <button
                type="button"
                onClick={() => setRequestType('both')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  requestType === 'both'
                    ? 'border-[#68452D] bg-[#F0ECE5] ring-1 ring-[#68452D]'
                    : 'border-[#E7E1D9] bg-[#F8F6F2] hover:border-[#68452D]'
                }`}
              >
                <CalendarCheck className="w-5 h-5 text-[#68452D] mb-2" />
                <h4 className="text-xs font-bold text-[#29231E]">Quote + Visit</h4>
                <p className="text-[11px] text-[#77716A] mt-0.5">Online estimate & on-site measurement</p>
              </button>
            </div>
          </div>

          {/* Conditional Visit Details */}
          {requestType !== 'quote' && (
            <div className="p-5 bg-[#F8F6F2] rounded-2xl border border-[#E7E1D9] space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#68452D] block">
                In-Home Measurement Visit Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#29231E] block mb-1">
                    Your Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={visitAddress}
                    onChange={(e) => setVisitAddress(e.target.value)}
                    placeholder="e.g. Flat 302, Civil Lines, Jaipur"
                    className="w-full bg-white border border-[#E7E1D9] rounded-xl px-3.5 py-2 text-xs text-[#29231E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#29231E] block mb-1">
                    Preferred Visit Date & Time
                  </label>
                  <input
                    type="text"
                    value={preferredVisitDate}
                    onChange={(e) => setPreferredVisitDate(e.target.value)}
                    placeholder="e.g. This Saturday after 2 PM"
                    className="w-full bg-white border border-[#E7E1D9] rounded-xl px-3.5 py-2 text-xs text-[#29231E] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: CONTACT INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Sudhanshu Sharma"
                className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="client@gmail.com"
                className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-4 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isUploading ? (
                <span>Uploading Files to Workshop ({filesToUpload.length})...</span>
              ) : (
                <>
                  <span>
                    {requestType === 'quote'
                      ? 'Submit Idea & Request Itemized Quotation'
                      : requestType === 'book_visit'
                      ? 'Confirm & Schedule In-Home Measurement'
                      : 'Submit Idea & Schedule In-Home Visit'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
