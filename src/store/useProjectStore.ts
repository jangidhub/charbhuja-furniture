/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { CustomerProject } from '../types';
import {
  createProject as fsCreateProject,
  updateProject as fsUpdateProject,
  deleteProject as fsDeleteProject,
} from '../services/firebase/firestore';

interface ProjectState {
  projects: CustomerProject[];
  activeProjectId: string | null;
  setProjects: (projects: CustomerProject[]) => void;
  createProject: (
    name: string,
    description?: string,
    roomType?: string,
    userId?: string
  ) => Promise<string>;
  deleteProject: (projectId: string) => Promise<void>;
  addProductToProject: (projectId: string, productId: string) => Promise<void>;
  removeProductFromProject: (projectId: string, productId: string) => Promise<void>;
  updateProjectNotes: (projectId: string, notes: string) => Promise<void>;
  setActiveProject: (projectId: string | null) => void;
}

const DEFAULT_PROJECTS: CustomerProject[] = [
  {
    projectId: 'proj-living-room',
    userId: 'guest_user',
    name: 'Living Room Renovation',
    description: 'Bespoke teak seating and fluted console setup',
    roomType: 'Living Room',
    productIds: ['cb-sofa-01', 'cb-chair-01'],
    notes: 'Need warm honey teak polish to match existing oak flooring.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    projectId: 'proj-master-bedroom',
    userId: 'guest_user',
    name: 'Master Suite Wardrobe',
    description: 'Custom fluted walk-in dressing suite with LED bay',
    roomType: 'Master Bedroom',
    productIds: ['cb-walkin-01'],
    notes: 'Ceiling height is 9.5 feet. Need ceiling infill panel.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: DEFAULT_PROJECTS,
  activeProjectId: 'proj-living-room',

  setProjects: (projects) => {
    set({
      projects: projects.length > 0 ? projects : DEFAULT_PROJECTS,
      activeProjectId:
        get().activeProjectId && projects.some((p) => p.projectId === get().activeProjectId)
          ? get().activeProjectId
          : projects[0]?.projectId || DEFAULT_PROJECTS[0]?.projectId || null,
    });
  },

  createProject: async (name, description, roomType = 'Living Room', userId = 'guest_user') => {
    const newId = `proj-${Date.now()}`;
    const newProj: CustomerProject = {
      projectId: newId,
      userId,
      name,
      description: description || '',
      roomType,
      productIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      projects: [...state.projects, newProj],
      activeProjectId: newId,
    }));

    if (userId && userId !== 'guest_user') {
      try {
        await fsCreateProject(newProj);
      } catch (err) {
        console.warn('Syncing project to Firestore fallback:', err);
      }
    }
    return newId;
  },

  deleteProject: async (projectId) => {
    const current = get().projects.find((p) => p.projectId === projectId);
    set((state) => ({
      projects: state.projects.filter((p) => p.projectId !== projectId),
      activeProjectId: state.activeProjectId === projectId ? null : state.activeProjectId,
    }));

    if (current && current.userId && current.userId !== 'guest_user') {
      try {
        await fsDeleteProject(projectId);
      } catch (err) {
        console.warn('Deleting project from Firestore fallback:', err);
      }
    }
  },

  addProductToProject: async (projectId, productId) => {
    let updatedProj: CustomerProject | null = null;

    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.projectId === projectId) {
          if (p.productIds.includes(productId)) return p;
          const updated = {
            ...p,
            productIds: [...p.productIds, productId],
            updatedAt: new Date().toISOString(),
          };
          updatedProj = updated;
          return updated;
        }
        return p;
      }),
    }));

    if (updatedProj && (updatedProj as CustomerProject).userId !== 'guest_user') {
      try {
        await fsUpdateProject(projectId, {
          productIds: (updatedProj as CustomerProject).productIds,
        });
      } catch (err) {
        console.warn('Updating project in Firestore fallback:', err);
      }
    }
  },

  removeProductFromProject: async (projectId, productId) => {
    let updatedList: string[] = [];
    let projUserId = 'guest_user';

    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.projectId === projectId) {
          updatedList = p.productIds.filter((id) => id !== productId);
          projUserId = p.userId;
          return {
            ...p,
            productIds: updatedList,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      }),
    }));

    if (projUserId !== 'guest_user') {
      try {
        await fsUpdateProject(projectId, { productIds: updatedList });
      } catch (err) {
        console.warn('Removing item from Firestore project fallback:', err);
      }
    }
  },

  updateProjectNotes: async (projectId, notes) => {
    let projUserId = 'guest_user';

    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.projectId === projectId) {
          projUserId = p.userId;
          return { ...p, notes, updatedAt: new Date().toISOString() };
        }
        return p;
      }),
    }));

    if (projUserId !== 'guest_user') {
      try {
        await fsUpdateProject(projectId, { notes });
      } catch (err) {
        console.warn('Updating notes in Firestore project fallback:', err);
      }
    }
  },

  setActiveProject: (projectId) => set({ activeProjectId: projectId }),
}));
