const Announcement = require('../models/Announcement');
const Group = require('../models/Group');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getMyGroupIds } = require('./sessionController');

/**
 * @route   GET /api/groups/:id/announcements
 * @desc    All announcements of one group (latest first)
 * @access  Private (member)
 */
const getGroupAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({ group: req.params.id })
    .populate('postedBy', 'name course avatarColor')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: announcements.length, data: { announcements } });
});

/**
 * @route   POST /api/groups/:id/announcements
 * @desc    Post an announcement (owner only)
 * @access  Private (Owner)
 */
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message } = req.body;

  const announcement = await Announcement.create({
    group: req.group._id,
    title,
    message,
    postedBy: req.user._id,
  });

  const populated = await Announcement.findById(announcement._id).populate('postedBy', 'name course avatarColor');

  res.status(201).json({
    success: true,
    message: 'Announcement posted successfully.',
    data: { announcement: populated },
  });
});

/**
 * @route   PUT /api/announcements/:id
 * @desc    Edit an announcement (owner only)
 * @access  Private (Owner)
 */
const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw new ApiError(404, 'Announcement not found');

  const group = await Group.findById(announcement.group);
  if (!group) throw new ApiError(404, 'Study group not found');
  if (group.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Access denied: only the group owner can edit announcements');
  }

  if (req.body.title) announcement.title = req.body.title;
  if (req.body.message) announcement.message = req.body.message;
  await announcement.save();

  const populated = await Announcement.findById(announcement._id).populate('postedBy', 'name course avatarColor');
  res.status(200).json({ success: true, message: 'Announcement updated successfully', data: { announcement: populated } });
});

/**
 * @route   DELETE /api/announcements/:id
 * @desc    Delete an announcement (owner only)
 * @access  Private (Owner)
 */
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw new ApiError(404, 'Announcement not found');

  const group = await Group.findById(announcement.group);
  if (!group) throw new ApiError(404, 'Study group not found');
  if (group.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Access denied: only the group owner can delete announcements');
  }

  await announcement.deleteOne();
  res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
});

/**
 * @route   GET /api/announcements/my
 * @desc    Announcements from every group the user belongs to
 * @access  Private
 */
const getMyAnnouncements = asyncHandler(async (req, res) => {
  const groupIds = await getMyGroupIds(req.user._id);

  const announcements = await Announcement.find({ group: { $in: groupIds } })
    .populate('group', 'name subject topic createdBy')
    .populate('postedBy', 'name avatarColor')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: announcements.length, data: { announcements } });
});

module.exports = {
  getGroupAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getMyAnnouncements,
};
