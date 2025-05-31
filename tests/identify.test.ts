import request from 'supertest';
import app from '../src/app';
import prisma from '../src/prisma';

describe('POST /identify', () => {
  beforeAll(async () => {
    await prisma.contact.deleteMany(); // Clear previous test data
  });

  it('should create a new primary contact', async () => {
    const res = await request(app).post('/identify').send({
      email: 'doc@fluxkart.com',
      phoneNumber: '123456'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.contact.primaryContactId).toBeDefined();
    expect(res.body.contact.secondaryContactIds).toEqual([]);
  });

  it('should create a secondary contact for new email with same phone', async () => {
    const res = await request(app).post('/identify').send({
      email: 'mcfly@hillvalley.edu',
      phoneNumber: '123456'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.contact.secondaryContactIds.length).toBeGreaterThan(0);
    expect(res.body.contact.emails).toContain('mcfly@hillvalley.edu');
  });

  it('should return the same consolidated response with only phone', async () => {
    const res = await request(app).post('/identify').send({
      phoneNumber: '123456'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.contact.phoneNumbers).toContain('123456');
  });

  it('should return 400 if both email and phoneNumber are missing', async () => {
    const res = await request(app).post('/identify').send({});
    expect(res.statusCode).toBe(400);
  });

  it('should merge two primaries when email and phone link them together', async () => {
  // Create two separate primary contacts
  const primary1 = await prisma.contact.create({
    data: {
      email: 'merge1@example.com',
      phoneNumber: '111111',
      linkPrecedence: 'primary'
    }
  });

  const primary2 = await prisma.contact.create({
    data: {
      email: 'merge2@example.com',
      phoneNumber: '222222',
      linkPrecedence: 'primary'
    }
  });

  // This request links the two primaries
  const res = await request(app).post('/identify').send({
    email: 'merge1@example.com',
    phoneNumber: '222222'
  });

  expect(res.statusCode).toBe(200);
  const contact = res.body.contact;

  expect(contact.primaryContactId).toBe(primary1.id); // oldest becomes primary
  expect(contact.secondaryContactIds).toContain(primary2.id); // second reassigned
  expect(contact.emails).toEqual(
    expect.arrayContaining(['merge1@example.com', 'merge2@example.com'])
  );
  expect(contact.phoneNumbers).toEqual(
    expect.arrayContaining(['111111', '222222'])
  );
});

it('should return existing contact if only known email is provided', async () => {
  const primary = await prisma.contact.create({
    data: {
      email: 'knownemail@example.com',
      phoneNumber: '555555',
      linkPrecedence: 'primary'
    }
  });

  const res = await request(app).post('/identify').send({
    email: 'knownemail@example.com',
    phoneNumber: null
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.contact.primaryContactId).toBe(primary.id);
  expect(res.body.contact.emails).toContain('knownemail@example.com');
  expect(res.body.contact.phoneNumbers).toContain('555555');
});


it('should create a new primary contact if only new email is provided', async () => {
  const res = await request(app).post('/identify').send({
    email: 'newemail@example.com',
    phoneNumber: null
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.contact.primaryContactId).toBeDefined();
  expect(res.body.contact.emails).toContain('newemail@example.com');
  expect(res.body.contact.phoneNumbers.length).toBe(0); // no phone number
  expect(res.body.contact.secondaryContactIds.length).toBe(0);
});



});
