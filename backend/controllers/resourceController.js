const Resource = require('../models/Resource');
const Group = require('../models/Group');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getMyGroupIds } = require('./sessionController');

/**
 * @route   GET /api/groups/:id/resources
 * @desc    All resources shared in a group (optionally filtered by type / search)
 * @access  Private (member)
 */
const getGroupResources = asyncHandler(async (req, res) => {
  const filter = { group: req.params.id };
  if (req.query.type) filter.type = req.query.type;
  if (req.query.q) filter.title = new RegExp(req.query.q, 'i');

  const resources = await Resource.find(filter)
    .populate('addedBy', 'name course avatarColor')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: resources.length, data: { resources } });
});

/**
 * @route   POST /api/groups/:id/resources
 * @desc    Share a new resource in the group
 * @access  Private (member)
 */
const createResource = asyncHandler(async (req, res) => {
  const { title, type, url, description } = req.body;

  const resource = await Resource.create({
    group: req.group._id,
    title,
    type,
    url,
    description: description || '',
    addedBy: req.user._id,
  });

  const populated = await Resource.findById(resource._id).populate('addedBy', 'name course avatarColor');

  res.status(201).json({
    success: true,
    message: 'Resource shared successfully.',
    data: { resource: populated },
  });
});

/**
 * @route   PUT /api/resources/:id
 * @desc    Edit a resource (whoever added it, or the group owner)
 * @access  Private
 */
const updateResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) throw new ApiError(404, 'Resource not found');

  const group = await Group.findById(resource.group);
  if (!group) throw new ApiError(404, 'Study group not found');

  const isOwner = group.createdBy.toString() === req.user._id.toString();
  const isCreator = resource.addedBy.toString() === req.user._id.toString();
  if (!isOwner && !isCreator) {
    throw new ApiError(403, 'Access denied: you can only edit resources that you added');
  }

  const { title, type, url, description } = req.body;
  if (title) resource.title = title;
  if (type) resource.type = type;
  if (url) resource.url = url;
  if (description !== undefined) resource.description = description;

  await resource.save();

  const populated = await Resource.findById(resource._id).populate('addedBy', 'name course avatarColor');
  res.status(200).json({ success: true, message: 'Resource updated successfully', data: { resource: populated } });
});

/**
 * @route   DELETE /api/resources/:id
 * @desc    Delete a resource (whoever added it, or the group owner)
 * @access  Private
 */
const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) throw new ApiError(404, 'Resource not found');

  const group = await Group.findById(resource.group);
  const isOwner = group && group.createdBy.toString() === req.user._id.toString();
  const isCreator = resource.addedBy.toString() === req.user._id.toString();

  if (!isOwner && !isCreator) {
    throw new ApiError(403, 'Access denied: you can only delete resources that you added');
  }

  await resource.deleteOne();
  res.status(200).json({ success: true, message: 'Resource deleted successfully' });
});

/**
 * @route   GET /api/resources/my
 * @desc    Resources shared across all the groups of the logged in user
 * @access  Private
 */
const getMyResources = asyncHandler(async (req, res) => {
  const groupIds = await getMyGroupIds(req.user._id);

  const resources = await Resource.find({ group: { $in: groupIds } })
    // createdBy is needed so the group owner can manage every resource
    .populate('group', 'name subject topic createdBy')
    .populate('addedBy', 'name avatarColor')
    .sort({ createdAt: -1 });

  // Distinct types for the filter chips
  const types = [...new Set(resources.map((r) => r.type))];

  res.status(200).json({ success: true, count: resources.length, data: { resources, types } });
});

module.exports = {
  getGroupResources,
  createResource,
  updateResource,
  deleteResource,
  getMyResources,
};
