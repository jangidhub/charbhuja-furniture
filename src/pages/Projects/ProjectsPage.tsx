/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FolderHeart,
  Plus,
  Trash2,
  FileText,
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
  Camera,
  Ruler,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  subscribeUserProjects,
  subscribeUserIdeaRequests,
  getProducts,
  CustomIdeaSubmission,
} from '../../services/firebase/firestore';
import { INITIAL_PRODUCTS } from '../../data/products';
import { Product, CustomerProject } from '../../types';

const ROOM_TYPES = [
  'Living Room',
  'Master Bedroom',
  'Guest Bedroom',
  'Dining Hall',
  'Walk-in Wardrobe Suite',
  'Modular Kitchen',
  'Home Office / Study',
  'Full Residence',
];

export const ProjectsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlProjectId = searchParams.get('id');

  const { user } = useAuthStore();
  const {
    projects,
    setProjects,
    activeProjectId,
    setActiveProject,
    createProject,
    deleteProject,
    removeProductFromProject,
    updateProjectNotes,
  } = useProjectStore();

  const { addItem } = useCartStore();

  // Local states
  const [allProducts, setAllProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [userIdeas, setUserIdeas] = useState<CustomIdeaSubmission[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectRoom, setNewProjectRoom] = useState(ROOM_TYPES[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [combinedQuoteSuccess, setCombinedQuoteSuccess] = useState(false);

  // Sync projects and custom requests with Firestore for authenticated user
  useEffect(() => {
    // Fetch products catalog for references
    getProducts().then((data) => {
      if (data && data.length > 0) setAllProducts(data);
    });

    if (user?.uid) {
      const unsubProjects = subscribeUserProjects(user.uid, (data) => {
        if (data && data.length > 0) {
          setProjects(data);
        }
      });

      const unsubIdeas = subscribeUserIdeaRequests(user.uid, (ideas) => {
        if (ideas) setUserIdeas(ideas);
      });

      return () => {
        unsubProjects();
        unsubIdeas();
      };
    }
  }, [user?.uid, setProjects]);

  useEffect(() => {
    if (urlProjectId) {
      setActiveProject(urlProjectId);
    }
  }, [urlProjectId, setActiveProject]);

  const activeProject =
    projects.find((p) => p.projectId === activeProjectId) || projects[0];

  const savedProducts = activeProject
    ? allProducts.filter((p) => activeProject.productIds?.includes(p.productId))
    : [];

  const associatedIdeas = activeProject
    ? userIdeas.filter((idea) => idea.projectId === activeProject.projectId)
    : [];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      const newId = await createProject(
        newProjectName.trim(),
        newProjectDesc.trim(),
        newProjectRoom,
        user?.uid || 'guest_user'
      );
      setNewProjectName('');
      setNewProjectDesc('');
      setShowCreateModal(false);
      searchParams.set('id', newId);
      setSearchParams(searchParams);
    }
  };

  const handleAddAllToCart = () => {
    savedProducts.forEach((p) => addItem(p, 1));
  };

  const handleRequestCombinedQuote = () => {
    setCombinedQuoteSuccess(true);
    setTimeout(() => setCombinedQuoteSuccess(false), 5000);
  };

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[#E7E1D9] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0ECE5] border border-[#E7E1D9] text-[11px] font-semibold uppercase tracking-wider text-[#68452D] mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Interior Space Planning & Collections</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#29231E]">
              My Project Collections
            </h1>
            <p className="text-xs sm:text-sm text-[#77716A] mt-1 max-w-2xl leading-relaxed">
              Curate and coordinate your residential spaces room by room. Pair curated trending pieces with custom photo uploads, floor plans, and request combined manufacturer quotations.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#29231E] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#68452D] transition-colors self-start md:self-auto shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Room Project</span>
          </button>
        </div>

        {/* Project Selector Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-6 no-scrollbar">
          {projects.map((proj) => {
            const isSelected = activeProject?.projectId === proj.projectId;
            return (
              <button
                key={proj.projectId}
                onClick={() => {
                  setActiveProject(proj.projectId);
                  searchParams.set('id', proj.projectId);
                  setSearchParams(searchParams);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#68452D] text-white shadow-xs'
                    : 'bg-white text-[#77716A] border border-[#E7E1D9] hover:text-[#29231E]'
                }`}
              >
                <FolderHeart className="w-4 h-4" />
                <span>{proj.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20' : 'bg-[#F0ECE5] text-[#29231E]'}`}>
                  {(proj.productIds?.length || 0) + userIdeas.filter((i) => i.projectId === proj.projectId).length}
                </span>
              </button>
            );
          })}
        </div>

        {activeProject ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Saved Pieces & Associated Custom Ideas */}
            <div className="lg:col-span-8 space-y-6">
              {/* Project Card */}
              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E7E1D9] gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#A17A58]">
                      {activeProject.roomType || 'Room Suite'}
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#29231E] mt-0.5">
                      {activeProject.name}
                    </h2>
                    {activeProject.description && (
                      <p className="text-xs text-[#77716A] mt-1 leading-relaxed">
                        {activeProject.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/upload-idea?project=${activeProject.projectId}`}
                      className="px-4 py-2 rounded-full bg-[#F0ECE5] hover:bg-[#E7E1D9] text-[#68452D] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Idea to Room</span>
                    </Link>
                    <button
                      onClick={() => deleteProject(activeProject.projectId)}
                      className="p-2 text-[#77716A] hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                      title="Delete this project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section A: Curated Products Saved to Room */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#29231E]">
                      Curated Pieces in this Room ({savedProducts.length})
                    </h3>
                    <Link to="/browse" className="text-xs text-[#68452D] font-medium hover:underline flex items-center gap-1">
                      <span>Add trending piece</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {savedProducts.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-[#F8F6F2] border border-[#E7E1D9] text-xs text-[#77716A] space-y-2">
                      <p>No catalog pieces saved in this room yet.</p>
                      <Link
                        to="/browse"
                        className="inline-block px-4 py-2 bg-[#29231E] text-white rounded-full text-[11px] font-semibold uppercase tracking-wider hover:bg-[#68452D]"
                      >
                        Explore Trending Pieces
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E7E1D9]">
                      {savedProducts.map((p) => (
                        <div
                          key={p.productId}
                          className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={p.images[0] || '/assets/logo.png'}
                              alt={p.name}
                              className="w-16 h-16 rounded-xl object-cover bg-[#F0ECE5] shrink-0 border border-[#E7E1D9]"
                            />
                            <div>
                              <Link
                                to={`/product/${p.productId}`}
                                className="font-serif text-sm font-bold text-[#29231E] hover:text-[#68452D] transition-colors"
                              >
                                {p.name}
                              </Link>
                              <p className="text-xs text-[#77716A] mt-0.5">
                                {p.categoryName} · {p.dimensions.width}×{p.dimensions.depth}×{p.dimensions.height} {p.dimensions.unit}
                              </p>
                              <span className="text-xs font-semibold text-[#68452D] mt-1 block tabular-nums">
                                ₹{p.price.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              onClick={() => addItem(p, 1)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#F8F6F2] border border-[#E7E1D9] text-xs font-medium text-[#29231E] hover:bg-[#E7E1D9] transition-colors flex items-center gap-1.5"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Order</span>
                            </button>

                            <button
                              onClick={() => removeProductFromProject(activeProject.projectId, p.productId)}
                              className="p-1.5 text-[#77716A] hover:text-red-600 rounded-lg transition-colors"
                              title="Remove from room"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section B: Custom Design Uploads Linked to Room */}
                <div className="pt-4 border-t border-[#E7E1D9]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#29231E] flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#68452D]" />
                      <span>Custom Design Requests Linked to this Room ({associatedIdeas.length})</span>
                    </h3>
                    <Link
                      to={`/upload-idea?project=${activeProject.projectId}`}
                      className="text-xs text-[#68452D] font-medium hover:underline"
                    >
                      + Upload photo for quote
                    </Link>
                  </div>

                  {associatedIdeas.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl bg-[#F8F6F2] border border-[#E7E1D9] text-xs text-[#77716A]">
                      No custom photos uploaded for this room yet. Have a Pinterest screenshot? Click "+ Upload photo for quote" above.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {associatedIdeas.map((idea) => (
                        <div
                          key={idea.requestId}
                          className="p-4 rounded-2xl bg-[#F8F6F2] border border-[#E7E1D9] flex items-center justify-between gap-4 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={idea.imageUrl || '/assets/logo.png'}
                              alt={idea.itemType}
                              className="w-12 h-12 rounded-xl object-cover bg-white border border-[#E7E1D9] shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#29231E]">
                                  Ref #{idea.requestId} — {idea.itemType.toUpperCase()}
                                </span>
                                <span
                                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                    idea.status === 'quote_sent'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {idea.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-[#77716A] line-clamp-1 mt-0.5">{idea.description}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {idea.quotedAmount ? (
                              <span className="font-serif font-bold text-sm text-[#68452D] block">
                                {idea.quotedAmount}
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#77716A] italic">Reviewing...</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Room Notes & Architectural Quotation */}
            <div className="lg:col-span-4 space-y-6">
              {/* Room Specifications & Notes */}
              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#68452D]" />
                  <h3 className="font-serif text-base font-bold text-[#29231E]">Room Architectural Notes</h3>
                </div>
                <p className="text-xs text-[#77716A]">
                  Record measurements, electrical points, wall lengths, or timber polish tones for this room:
                </p>
                <textarea
                  rows={4}
                  value={activeProject.notes || ''}
                  onChange={(e) => updateProjectNotes(activeProject.projectId, e.target.value)}
                  placeholder="e.g. Wall dimension is 12.5 ft. Sockets at 18 inches height. Match polish with existing dark walnut floor..."
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-2xl p-3.5 text-xs text-[#29231E] focus:outline-none focus:border-[#68452D]"
                />
              </div>

              {/* Combined Quotation Card */}
              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-[#29231E]">
                  Combined Room Quotation
                </h3>
                <p className="text-xs text-[#77716A] leading-relaxed">
                  Submit this room collection for an itemized manufacturer quotation covering timber sizing, joinery adjustments, and unified delivery to your residence.
                </p>

                {combinedQuoteSuccess ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2 text-xs text-green-800">
                    <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0" />
                    <span>Quotation request received! Our senior workshop architect will review this room suite.</span>
                  </div>
                ) : (
                  <button
                    onClick={handleRequestCombinedQuote}
                    disabled={savedProducts.length === 0 && associatedIdeas.length === 0}
                    className="w-full py-3.5 px-4 bg-[#68452D] text-white rounded-2xl text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-colors shadow-2xs disabled:opacity-40"
                  >
                    Request Combined Room Quotation
                  </button>
                )}

                {savedProducts.length > 0 && (
                  <button
                    onClick={handleAddAllToCart}
                    className="w-full py-3 px-4 bg-[#F8F6F2] text-[#29231E] border border-[#E7E1D9] rounded-2xl text-xs font-semibold uppercase tracking-wider hover:bg-[#E7E1D9] transition-colors"
                  >
                    Add {savedProducts.length} Saved Pieces to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Modal: Create Room Project */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-[#E7E1D9] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#29231E]">New Room Project Collection</h3>
              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                    Room / Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g. Master Bedroom, Living Suite, Penthouse Dining"
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3.5 py-2.5 text-[#29231E] focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                    Room Type *
                  </label>
                  <select
                    value={newProjectRoom}
                    onChange={(e) => setNewProjectRoom(e.target.value)}
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3 py-2 text-[#29231E] focus:outline-none"
                  >
                    {ROOM_TYPES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                    Short Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    placeholder="e.g. Modern minimalist teak aesthetic with fluted wall paneling"
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3.5 py-2.5 text-[#29231E] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-[#77716A] hover:text-[#29231E] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#68452D] text-white rounded-xl font-semibold uppercase tracking-wider hover:bg-[#523724]"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
