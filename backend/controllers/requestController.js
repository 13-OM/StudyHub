const Group = require('../models/Group');
const JoinRequest = require('../models/JoinRequest');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const USER_FIELDS = 'name email course skillLevel avatarColor';

/**
 * @route   POST /api/groups/:id/join
 * @desc    Send a join request for a study group
 * @access  Private
 */
const createJoinRequest = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) throw new ApiError(404, 'Study group not found');

  const userId = req.user._id;

  // The owner is already a member -> no request needed
  if (group.createdBy.toString() === userId.toString()) {
    throw new ApiError(400, 'You are the owner of this group');
  }

  const alreadyMember = group.members.some(
    (m) => m.user.toString() === userId.toString()
  );
  if (alreadyMember) {
    throw new ApiError(400, 'You are already a member of this group');
  }

  if (group.members.length >= group.maxCapacity) {
    throw new ApiError(400, 'This group has reached its maximum capacity');
  }

  const existing = await JoinRequest.findOne({ group: group._id, user: userId });

  if (existing) {
    if (existing.status === 'Pending') {
      throw new ApiError(400, 'Your join request is already pending approval');
    }
    if (existing.status === 'Rejected') {
      // allow a student to ask again after a rejection
      existing.status = 'Pending';
      existing.message = req.body.message || '';
      existing.respondedBy = undefined;
      existing.respondedAt = undefined;
      await existing.save();
      return res.status(200).json({
        success: true,
        message: 'Join request sent again to the group owner',
        data: { request: existing },
      });
    }
    throw new ApiError(400, 'You are already a member of this group');
  }

  const request = await JoinRequest.create({
    group: group._id,
    user: userId,
    message: req.body.message || '',
    status: 'Pending',
  });

  res.status(201).json({
    success: true,
    message: 'Join request sent successfully. Waiting for the owner to approve.',
    data: { request },
  });
});

/**
 * @route   GET /api/groups/:id/requests
 * @desc    All join requests of a group (owner only)
 * @access  Private (Owner)
 */
const getGroupRequests = asyncHandler(async (req, res) => {
  const requests = await JoinRequest.find({ group: req.params.id })
    .populate('user', USER_FIELDS)
    .populate('respondedBy', 'name')
    .sort({ createdAt: -1 });

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;

  res.status(200).json({
    success: true,
    count: requests.length,
    pendingCount,
    data: { requests },
  });
});

/**
 * @route   PUT /api/requests/:id/approve
 * @desc    Approve a join request -> the student becomes a member
 * @access  Private (Owner)
 */
const approveRequest = asyncHandler(async (req, res) => {
  const request = await JoinRequest.findById(req.params.id).populate('user', USER_FIELDS);
  if (!request) throw new ApiError(404, 'Join request not found');

  if (request.status === 'Approved') {
    throw new ApiError(400, 'This request is already approved');
  }
  if (request.status === 'Rejected' && request.respondedAt) {
    throw new ApiError(400, 'This request was already rejected. The student must request again.');
  }

  const group = await Group.findById(request.group);
  if (!group) throw new ApiError(404, 'Study group not found');

  // only the owner may approve
  if (group.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Access denied: only the group owner can approve requests');
  }

  if (group.members.length >= group.maxCapacity) {
    throw new ApiError(400, 'Group capacity is full. Increase the capacity before approving.');
  }

  const alreadyMember = group.members.some(
    (m) => m.user.toString() === request.user._id.toString()
  );
  if (!alreadyMember) {
    group.members.push({ user: request.user._id, role: 'Member', joinedAt: new Date() });
    await group.save();
  }

  request.status = 'Approved';
  request.respondedBy = req.user._id;
  request.respondedAt = new Date();
  await request.save();

  res.status(200).json({
    success: true,
    message: `${request.user.name} was added to the group`,
    data: { request },
  });
});

/**
 * @route   PUT /api/requests/:id/reject
 * @desc    Reject a join request (owner only)
 * @access  Private (Owner)
 */
const rejectRequest = asyncHandler(async (req, res) => {
  const request = await JoinRequest.findById(req.params.id).populate('user', USER_FIELDS);
  if (!request) throw new ApiError(404, 'Join request not found');

  if (request.status === 'Rejected') {
    throw new ApiError(400, 'This request is already rejected');
  }

  const group = await Group.findById(request.group);
  if (!group) throw new ApiError(404, 'Study group not found');

  if (group.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Access denied: only the group owner can reject requests');
  }

  request.status = 'Rejected';
  request.respondedBy = req.user._id;
  request.respondedAt = new Date();
  await request.save();

  res.status(200).json({
    success: true,
    message: `Join request from ${request.user.name} was rejected`,
    data: { request },
  });
});

/**
 * @route   GET /api/requests/my
 * @desc    Requests sent by the logged in user
 * @access  Private
 */
const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await JoinRequest.find({ user: req.user._id })
    .populate('group', 'name subject topic course skillLevel maxCapacity members')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: requests.length, data: { requests } });
});

/**
 * @route   GET /api/requests/incoming
 * @desc    Every pending request across all groups owned by the logged in user
 * @access  Private
 */
const getIncomingRequests = asyncHandler(async (req, res) => {
  const myGroups = await Group.find({ createdBy: req.user._id }).select('_id name subject');
  const groupIds = myGroups.map((g) => g._id);

  const requests = await JoinRequest.find({ group: { $in: groupIds } })
    .populate('user', USER_FIELDS)
    .populate('group', 'name subject topic')
    .sort({ status: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    pendingCount: requests.filter((r) => r.status === 'Pending').length,
    data: { requests },
  });
});

module.exports = {
  createJoinRequest,
  getGroupRequests,
  approveRequest,
  rejectRequest,
  getMyRequests,
  getIncomingRequests,
};
