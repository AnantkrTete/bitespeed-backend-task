import express, { Request, Response} from 'express';
import prisma from '../prisma';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Either email or phoneNumber is required.' });
  }

  try {
    const matchedContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { email: email || undefined },
          { phoneNumber: phoneNumber || undefined }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    if (matchedContacts.length === 0) {
      const newContact = await prisma.contact.create({
        data: {
          email: email || null,
          phoneNumber: phoneNumber || null,
          linkPrecedence: 'primary'
        }
      });

      return res.status(200).json({
        contact: {
          primaryContactId: newContact.id,
         emails: newContact.email ? [newContact.email] : [],
          phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],

          secondaryContactIds: []
        }
      });
    }

    const primaryContacts = matchedContacts.filter(c => c.linkPrecedence === 'primary');
    const oldestPrimary = primaryContacts[0] || matchedContacts[0];

    for (const contact of primaryContacts.slice(1)) {
      if (contact.id !== oldestPrimary.id) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            linkPrecedence: 'secondary',
            linkedId: oldestPrimary.id
          }
        });
      }
    }

    const exactMatch = matchedContacts.some(
      c => c.email === email && c.phoneNumber === phoneNumber
    );

    const emailExists = matchedContacts.some(c => c.email === email);
    const phoneExists = matchedContacts.some(c => c.phoneNumber === phoneNumber);

    // ✅ Only create a new secondary contact if new info is introduced
    if (!exactMatch && ((email && !emailExists) || (phoneNumber && !phoneExists))) {
      await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: 'secondary',
          linkedId: oldestPrimary.id
        }
      });
    }

    const finalContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { id: oldestPrimary.id },
          { linkedId: oldestPrimary.id }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    const uniqueEmails = Array.from(new Set(finalContacts.map(c => c.email).filter(Boolean)));
    const uniquePhones = Array.from(new Set(finalContacts.map(c => c.phoneNumber).filter(Boolean)));
    const secondaryIds = finalContacts
      .filter(c => c.linkPrecedence === 'secondary')
      .map(c => c.id);

    return res.status(200).json({
      contact: {
        primaryContactId: oldestPrimary.id,
        emails: uniqueEmails,
        phoneNumbers: uniquePhones,
        secondaryContactIds: secondaryIds
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error occurred' });
  }
});

export default router;
