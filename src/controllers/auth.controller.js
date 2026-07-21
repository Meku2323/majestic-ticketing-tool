import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Culturally relevant, humanized response templates
const MESSAGES = {
  en: {
    invalidUser: "We couldn't find an account matching that email address. Let's double check it!",
    wrongPassword: "The password you entered doesn't match our records. Please try again.",
    welcomeBack: "Welcome back, team! Let's clear some roadblocks today."
  },
  am: {
    invalidUser: "በዚህ ኢሜይል አድራሻ የተመዘገበ አካውንት ማግኘት አልቻልንም። እባክዎ ደግመው ያረጋግጡ!",
    wrongPassword: "ያስገቡት የይለፍ ቃል አልተዛመደም። እባክዎ እንደገና ይሞክሩ።",
    welcomeBack: "እንኳን ደህና መጡ! ዛሬ ያሉትን ችግሮች አብረን እንፍታ።"
  }
};

export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;
    const lang = req.headers['accept-language'] === 'am' ? 'am' : 'en';

    if (!email || !password) {
      return res.status(400).json({ 
        error: lang === 'am' ? 'እባክዎ ኢሜይል እና የይለፍ ቃል ያስገቡ።' : 'Please provide both email and password fields.' 
      });
    }

    // Lookup internal user by email identifier
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(401).json({ error: MESSAGES[lang].invalidUser });
    }

    // Perform secure cryptographic hash match configuration checking
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: MESSAGES[lang].wrongPassword });
    }

    // Issue signed state validation JWT token carrying active profile metadata context
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key_2026_ticketing',
      { expiresIn: '8h' } // Cleans house automatically after standard shifts expire
    );

    return res.status(200).json({
      message: MESSAGES[lang].welcomeBack,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyCurrentSession(req, res, next) {
  try {
    // Session profile state payload safely attached via upstream auth checking middleware
    return res.status(200).json({ authenticated: true, user: req.user });
  } catch (error) {
    next(error);
  }
}
