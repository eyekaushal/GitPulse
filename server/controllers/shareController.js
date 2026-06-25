const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { ShareLink } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'gitpulse-default-secret';

async function createShareLink(req, res, next) {
  try {
    const { shareType, usernames, snapshotData } = req.body;

    if (!shareType || !['profile', 'compare'].includes(shareType)) {
      return res.status(400).json({ error: 'shareType must be "profile" or "compare"' });
    }

    if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json({ error: 'usernames array is required' });
    }

    if (!snapshotData) {
      return res.status(400).json({ error: 'snapshotData is required' });
    }

    const slug = crypto.randomBytes(6).toString('base64url');
    const token = jwt.sign({ slug, usernames, shareType }, JWT_SECRET, { expiresIn: '30d' });

    const shareLink = await ShareLink.create({
      slug,
      shareType,
      usernames,
      snapshotData,
      token
    });

    return res.status(201).json({
      slug: shareLink.slug,
      url: `/share/${shareLink.slug}`,
      expiresIn: '30 days'
    });
  } catch (err) {
    next(err);
  }
}

async function getShareLink(req, res, next) {
  try {
    const { slug } = req.params;

    const shareLink = await ShareLink.findOne({ where: { slug } });
    if (!shareLink) {
      return res.status(404).json({ error: 'Share link not found or expired' });
    }

    // Verify token hasn't expired
    try {
      jwt.verify(shareLink.token, JWT_SECRET);
    } catch {
      return res.status(410).json({ error: 'Share link has expired' });
    }

    // Increment view count
    await shareLink.increment('viewCount');

    return res.json({
      shareType: shareLink.shareType,
      usernames: shareLink.usernames,
      snapshotData: shareLink.snapshotData,
      viewCount: shareLink.viewCount + 1,
      createdAt: shareLink.createdAt
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createShareLink, getShareLink };