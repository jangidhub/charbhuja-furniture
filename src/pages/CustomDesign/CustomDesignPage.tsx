/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { CustomDesignRequest, MeasurementUnit } from '../../types';

interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  type: string;
}

export const CustomDesignPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const prefillTitle = searchParams.get('title') || '';

  // Form State
  const [title, setTitle] = useState(prefillTitle ? `Custom ${prefillTitle}` : '');
  const [category, setCategory] = useState('sofas');
  const [roomType, setRoomType] = useState('Living Room');
  const [description, setDescription] = useState('');
  const [width, setWidth] = useState('180');
  const [height, setHeight] = useState('85');
  const [depth, setDepth] = useState('80');
  const [unit, setUnit] = useState<MeasurementUnit>('cm');
  const [preferredMaterial, setPreferredMaterial] = useState('Solid CP Teak Wood');
  const [preferredFinish, setPreferredFinish] = useState('Natural Matte Oil');
  const [estimatedBudget, setEstimatedBudget] = useState('₹50,000 – ₹1,00,000');
  const [expectedTimeline, setExpectedTimeline] = useState('4 - 6 Weeks');
  const [contactName, setContactName] = useState('Sudhanshu Sharma');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [contactEmail, setContactEmail] = useState('sudhanshu@charbhuja.com');

  // Files State
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<CustomDesignRequest | null>(null);

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndAddFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    setFileError('');

    const newFiles: UploadedFile[] = [];
    const maxSizeBytes = 15 * 1024 * 1024; // 15MB max per file

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // File type validation (Images and PDFs allowed, no executables)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setFileError(`File "${file.name}" is not an accepted format. Please upload JPG, PNG, WebP or PDF documents.`);
        continue;
      }

      // File size validation
      if (file.size > maxSizeBytes) {
        setFileError(`File "${file.name}" exceeds the maximum allowed size of 15MB.`);
        continue;
      }

      const previewUrl = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : '';

      newFiles.push({
        id: `${Date.now()}-${file.name}`,
        file,
        previewUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const requestRecord: CustomDesignRequest = {
        requestId: `CR-${Date.now().toString().slice(-6)}`,
        userId: 'demo_user_1',
        title,
        category,
        roomType,
        description,
        dimensions: {
          width: Number(width),
          height: Number(height),
          depth: Number(depth),
          unit,
        },
        preferredMaterial,
        preferredFinish,
        estimatedBudget,
        expectedTimeline,
        contactName,
        contactPhone,
        contactEmail,
        attachments: files.map((f) => ({
          name: f.name,
          url: f.previewUrl || '#',
          type: f.type,
          size: f.size,
        })),
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setSubmittedRequest(requestRecord);
      setIsSubmitting(false);
    }, 1000);
  };

  if (submittedRequest) {
    return (
      <div className="bg-[#F8F6F2] min-h-screen py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-[#E7E1D9] p-8 sm:p-12 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto border border-green-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#68452D]">
                Quotation Request Submitted
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#29231E] mt-1">
                Reference #{submittedRequest.requestId}
              </h1>
              <p className="text-sm text-[#77716A] mt-2 leading-relaxed">
                Thank you, {submittedRequest.contactName}. Our head master carpenter and estimation team are reviewing your dimensions, timber choice ({submittedRequest.preferredMaterial}), and {files.length} design attachment{files.length === 1 ? '' : 's'}.
              </p>
            </div>

            {/* Request Summary */}
            <div className="bg-[#F8F6F2] p-6 rounded-2xl border border-[#E7E1D9] text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-[#E7E1D9] pb-2">
                <span className="text-[#77716A]">Project Title</span>
                <span className="font-semibold text-[#29231E]">{submittedRequest.title}</span>
              </div>
              <div className="flex justify-between border-b border-[#E7E1D9] pb-2">
                <span className="text-[#77716A]">Dimensions</span>
                <span className="font-semibold text-[#29231E]">
                  {submittedRequest.dimensions.width} × {submittedRequest.dimensions.depth} × {submittedRequest.dimensions.height} {submittedRequest.dimensions.unit}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#E7E1D9] pb-2">
                <span className="text-[#77716A]">Estimated Budget</span>
                <span className="font-semibold text-[#29231E]">{submittedRequest.estimatedBudget}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77716A]">Current Status</span>
                <span className="font-bold text-[#68452D] uppercase tracking-wider">
                  Submitted · Under Review
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/account"
                className="px-6 py-3 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-colors"
              >
                Track in My Account
              </Link>
              <button
                onClick={() => {
                  setSubmittedRequest(null);
                  setFiles([]);
                }}
                className="px-6 py-3 bg-white border border-[#E7E1D9] text-[#29231E] rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#F0ECE5] transition-colors"
              >
                Submit Another Design
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#68452D] bg-[#F0ECE5] px-3 py-1 rounded-full border border-[#E7E1D9]">
            Custom Carpentry & Interiors
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#29231E]">
            Submit Your Custom Furniture Design
          </h1>
          <p className="text-sm text-[#77716A] leading-relaxed">
            Provide your room dimensions, preferred wood species, and reference sketches. We’ll generate an itemized manufacturer quotation with timber breakdowns.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E7E1D9] p-8 sm:p-12 shadow-sm space-y-8">
          {/* Section 1: Project & Furniture Category */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#29231E] border-b border-[#E7E1D9] pb-3">
              1. Project Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Bedroom Fluted Wardrobe"
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none focus:border-[#68452D]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                  Furniture Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none focus:border-[#68452D]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                  Room Type
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none focus:border-[#68452D]"
                >
                  <option value="Living Room">Living Room</option>
                  <option value="Master Bedroom">Master Bedroom</option>
                  <option value="Dining Room">Dining Room</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Home Office">Home Office</option>
                  <option value="Dressing Suite">Dressing Suite</option>
                  <option value="Full Residence">Full Residence</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                  Estimated Budget Range
                </label>
                <select
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value)}
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none focus:border-[#68452D]"
                >
                  <option value="Under ₹30,000">Under ₹30,000</option>
                  <option value="₹30,000 – ₹60,000">₹30,000 – ₹60,000</option>
                  <option value="₹60,000 – ₹1,20,000">₹60,000 – ₹1,20,000</option>
                  <option value="₹1,20,000 – ₹2,50,000">₹1,20,000 – ₹2,50,000</option>
                  <option value="₹2,50,000+ (Full Interior / Modular Suite)">
                    ₹2,50,000+ (Full Interior / Modular Suite)
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                Detailed Design Requirements & Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention specific details like internal drawer configurations, brass handles, soft-close hardware, wall offsets, or architectural nuances..."
                className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl p-4 text-xs text-[#29231E] focus:outline-none focus:border-[#68452D]"
              />
            </div>
          </div>

          {/* Section 2: Measurements */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#29231E] border-b border-[#E7E1D9] pb-3">
              2. Dimensions & Unit
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                  Width
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2 text-xs text-[#29231E] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                  Height
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2 text-xs text-[#29231E] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                  Depth
                </label>
                <input
                  type="number"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2 text-xs text-[#29231E] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as MeasurementUnit)}
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2 text-xs text-[#29231E] focus:outline-none"
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="mm">Millimeters (mm)</option>
                  <option value="inches">Inches (in)</option>
                  <option value="ft">Feet (ft)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                  Preferred Hardwood / Material
                </label>
                <input
                  type="text"
                  value={preferredMaterial}
                  onChange={(e) => setPreferredMaterial(e.target.value)}
                  placeholder="e.g. Solid CP Teak, Sheesham, Oak, Brass Inlay"
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                  Preferred Finish / Polish
                </label>
                <input
                  type="text"
                  value={preferredFinish}
                  onChange={(e) => setPreferredFinish(e.target.value)}
                  placeholder="e.g. Natural Matte Oil, Warm Walnut PU, Raw Satin"
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Drag & Drop File Upload */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#29231E] border-b border-[#E7E1D9] pb-3">
              3. Reference Drawings, Sketches & Photos
            </h3>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-[#68452D] bg-[#F0ECE5]'
                  : 'border-[#E7E1D9] bg-[#F8F6F2] hover:border-[#A17A58]'
              }`}
            >
              <UploadCloud className="w-10 h-10 text-[#68452D] mx-auto mb-3" />
              <p className="text-xs sm:text-sm font-semibold text-[#29231E]">
                Drag and drop your CAD drawings, photos, or architectural PDF files here
              </p>
              <p className="text-xs text-[#77716A] mt-1">
                Accepted: JPG, PNG, WebP, PDF (Max 15MB per file)
              </p>

              <label className="mt-4 inline-block px-5 py-2 rounded-full bg-[#29231E] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-[#68452D] transition-colors">
                <span>Browse Files</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => validateAndAddFiles(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>

            {fileError && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Uploaded Files Previews */}
            {files.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="relative group p-2 rounded-xl bg-[#F8F6F2] border border-[#E7E1D9] flex flex-col items-center text-center"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {file.previewUrl ? (
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                    ) : (
                      <div className="w-full h-24 rounded-lg bg-white flex items-center justify-center mb-2 text-[#77716A]">
                        <FileText className="w-8 h-8" />
                      </div>
                    )}

                    <span className="text-[11px] font-medium text-[#29231E] truncate w-full px-1">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-[#77716A]">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Contact Details */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#29231E] border-b border-[#E7E1D9] pb-3">
              4. Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-[#E7E1D9] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#77716A]">
              Quotations are typically dispatched within 24–48 hours with full timber specs.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting Specifications...</span>
              ) : (
                <>
                  <span>Request Manufacturing Quotation</span>
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
