import { describe, expect, it, vi } from 'vitest'
import { grantApprovedOwnerAccess } from './SolarOwnerApplications'

const approvedApplication = {
  id: 'application-1',
  user: 'user-1',
  status: 'approved',
}

describe('Solar Owner application approval', () => {
  it('grants the owner role and creates one owner profile through an admin review', async () => {
    const payload = {
      findByID: vi.fn().mockResolvedValue({
        id: 'user-1',
        firstName: 'Solar',
        lastName: 'Owner',
        roles: ['solar-owner-applicant'],
      }),
      update: vi.fn().mockResolvedValue({ id: 'user-1', roles: ['solar-owner'] }),
      find: vi.fn().mockResolvedValue({ totalDocs: 0, docs: [] }),
      create: vi.fn().mockResolvedValue({ id: 'profile-1' }),
    }
    await grantApprovedOwnerAccess({
      doc: approvedApplication,
      previousDoc: { ...approvedApplication, status: 'pending' },
      operation: 'update',
      req: { payload, user: { id: 'admin-1', collection: 'admins' } },
    } as never)

    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'users',
        id: 'user-1',
        data: { roles: ['solar-owner'] },
      }),
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'solar-owner-profiles',
        data: expect.objectContaining({ solarOwner: 'user-1', status: 'active' }),
      }),
    )
  })

  it('does not allow a non-admin identity to approve an application', async () => {
    await expect(
      grantApprovedOwnerAccess({
        doc: approvedApplication,
        previousDoc: { ...approvedApplication, status: 'pending' },
        operation: 'update',
        req: { payload: {}, user: { id: 'user-1', collection: 'users' } },
      } as never),
    ).rejects.toThrow('Only administrators')
  })
})
