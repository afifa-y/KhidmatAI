import dotenv from "dotenv";
dotenv.config({ override: true });
import { getDb } from "../server/db.ts";
import { providers, reviews } from "../drizzle/schema.ts";

async function seed() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    console.log("Seeding providers...");
    const insertedProviders = await db.insert(providers).values([
      // ── ELECTRICIANS (5) ──────────────────────────────
      {
        name: "Ahmed Electric Works",
        phone: "0300-1234567",
        email: "ahmed.elec@example.com",
        category: "electrician",
        specialty: "Fan installation, wiring repairs, UPS setup. Residential specialist.",
        locationText: "G-13, Islamabad",
        latitude: 33.6595, longitude: 73.0227,
        hourlyRate: 800, availabilityStatus: "available",
        isVerified: true, yearsExperience: 8, totalJobsDone: 340,
        avatarUrl: "https://i.pravatar.cc/150?u=ahmed"
      },
      {
        name: "Zain Electricians",
        phone: "0312-8887777",
        email: "zain.elec@example.com",
        category: "electrician",
        specialty: "Main board wiring, 3-phase connections, commercial electrical work.",
        locationText: "Blue Area, Islamabad",
        latitude: 33.7215, longitude: 73.0627,
        hourlyRate: 1500, availabilityStatus: "available",
        isVerified: true, yearsExperience: 15, totalJobsDone: 900,
        avatarUrl: "https://i.pravatar.cc/150?u=zain"
      },
      {
        name: "Bilal Budget Electric",
        phone: "0315-1112233",
        category: "electrician",
        specialty: "Cheap fan repair, switch replacement, basic wiring fixes.",
        locationText: "I-8, Islamabad",
        latitude: 33.6850, longitude: 73.0750,
        hourlyRate: 500, availabilityStatus: "available",
        isVerified: false, yearsExperience: 3, totalJobsDone: 90,
        avatarUrl: "https://i.pravatar.cc/150?u=bilal_elec"
      },
      {
        name: "Imran Solar & Electric",
        phone: "0331-4445566",
        category: "electrician",
        specialty: "Solar panel installation, inverter wiring, generator hookup.",
        locationText: "E-7, Islamabad",
        latitude: 33.7350, longitude: 73.0650,
        hourlyRate: 2000, availabilityStatus: "available",
        isVerified: true, yearsExperience: 10, totalJobsDone: 450,
        avatarUrl: "https://i.pravatar.cc/150?u=imran_solar"
      },
      {
        name: "Shahid Electric Point",
        phone: "0343-7778899",
        category: "electrician",
        specialty: "Emergency electrical repairs, short circuit fixing, meter installation.",
        locationText: "G-9, Islamabad",
        latitude: 33.6950, longitude: 73.0400,
        hourlyRate: 700, availabilityStatus: "busy",
        isVerified: true, yearsExperience: 6, totalJobsDone: 220,
        avatarUrl: "https://i.pravatar.cc/150?u=shahid_elec"
      },

      // ── PLUMBERS (5) ──────────────────────────────
      {
        name: "Bismillah Plumbing",
        phone: "0333-5551234",
        email: "plumbing@example.com",
        category: "plumber",
        specialty: "Leakage fixing, geyser repairs, water motor installation.",
        locationText: "G-9, Islamabad",
        latitude: 33.6995, longitude: 73.0627,
        hourlyRate: 600, availabilityStatus: "available",
        isVerified: true, yearsExperience: 12, totalJobsDone: 850,
        avatarUrl: "https://i.pravatar.cc/150?u=bismillah"
      },
      {
        name: "Rana Water Solutions",
        phone: "0321-6667788",
        category: "plumber",
        specialty: "Bathroom renovation, pipe fitting, sewerage line repair.",
        locationText: "F-10, Islamabad",
        latitude: 33.6990, longitude: 73.0130,
        hourlyRate: 1200, availabilityStatus: "available",
        isVerified: true, yearsExperience: 9, totalJobsDone: 500,
        avatarUrl: "https://i.pravatar.cc/150?u=rana_water"
      },
      {
        name: "Aslam Quick Plumber",
        phone: "0300-9991122",
        category: "plumber",
        specialty: "Emergency leak repair, tap replacement, basic plumbing fixes.",
        locationText: "G-11, Islamabad",
        latitude: 33.6795, longitude: 73.0427,
        hourlyRate: 400, availabilityStatus: "available",
        isVerified: false, yearsExperience: 2, totalJobsDone: 65,
        avatarUrl: "https://i.pravatar.cc/150?u=aslam_plumb"
      },
      {
        name: "Haji Plumbing & Sanitary",
        phone: "0345-3334455",
        category: "plumber",
        specialty: "Complete bathroom fitting, water tank installation, underground piping.",
        locationText: "H-8, Islamabad",
        latitude: 33.6900, longitude: 73.0500,
        hourlyRate: 900, availabilityStatus: "available",
        isVerified: true, yearsExperience: 18, totalJobsDone: 1200,
        avatarUrl: "https://i.pravatar.cc/150?u=haji_plumb"
      },
      {
        name: "Faisal Pipe Works",
        phone: "0302-5556677",
        category: "plumber",
        specialty: "Water heater repair, kitchen sink installation, drain cleaning.",
        locationText: "Bahria Town, Islamabad",
        latitude: 33.5200, longitude: 73.0900,
        hourlyRate: 700, availabilityStatus: "busy",
        isVerified: true, yearsExperience: 5, totalJobsDone: 180,
        avatarUrl: "https://i.pravatar.cc/150?u=faisal_pipe"
      },

      // ── AC TECHNICIANS (5) ──────────────────────────────
      {
        name: "Cool Tech AC Services",
        phone: "0321-9876543",
        email: "cooltech@example.com",
        category: "ac_technician",
        specialty: "Split AC installation, gas refilling, regular maintenance.",
        locationText: "F-7, Islamabad",
        latitude: 33.7195, longitude: 73.0427,
        hourlyRate: 1200, availabilityStatus: "available",
        isVerified: true, yearsExperience: 5, totalJobsDone: 210,
        avatarUrl: "https://i.pravatar.cc/150?u=cooltech"
      },
      {
        name: "Tariq AC Master",
        phone: "0345-4449999",
        category: "ac_technician",
        specialty: "DC Inverter specialist. Fixes cooling issues quickly.",
        locationText: "G-10, Islamabad",
        latitude: 33.6895, longitude: 73.0527,
        hourlyRate: 1000, availabilityStatus: "available",
        isVerified: true, yearsExperience: 6, totalJobsDone: 120,
        avatarUrl: "https://i.pravatar.cc/150?u=tariq"
      },
      {
        name: "Nadeem Cooling Center",
        phone: "0311-2223344",
        category: "ac_technician",
        specialty: "Window AC repair, compressor replacement, duct cleaning.",
        locationText: "I-8, Islamabad",
        latitude: 33.6870, longitude: 73.0770,
        hourlyRate: 800, availabilityStatus: "available",
        isVerified: false, yearsExperience: 4, totalJobsDone: 95,
        avatarUrl: "https://i.pravatar.cc/150?u=nadeem_ac"
      },
      {
        name: "Royal AC & Refrigeration",
        phone: "0333-8889900",
        category: "ac_technician",
        specialty: "Central AC systems, VRF installation, commercial HVAC.",
        locationText: "Blue Area, Islamabad",
        latitude: 33.7200, longitude: 73.0600,
        hourlyRate: 2500, availabilityStatus: "available",
        isVerified: true, yearsExperience: 12, totalJobsDone: 600,
        avatarUrl: "https://i.pravatar.cc/150?u=royal_ac"
      },
      {
        name: "Sajid Budget AC Fix",
        phone: "0300-4445566",
        category: "ac_technician",
        specialty: "Cheap gas refill, basic AC cleaning, minor repairs.",
        locationText: "G-13, Islamabad",
        latitude: 33.6600, longitude: 73.0250,
        hourlyRate: 500, availabilityStatus: "available",
        isVerified: false, yearsExperience: 2, totalJobsDone: 40,
        avatarUrl: "https://i.pravatar.cc/150?u=sajid_ac"
      },

      // ── CARPENTERS (3) ──────────────────────────────
      {
        name: "Islamabad Home Fix",
        phone: "0301-1112222",
        category: "carpenter",
        specialty: "Door lock repairs, custom wood polish, furniture assembly.",
        locationText: "F-10, Islamabad",
        latitude: 33.6995, longitude: 73.0127,
        hourlyRate: 900, availabilityStatus: "available",
        isVerified: true, yearsExperience: 4, totalJobsDone: 85,
        avatarUrl: "https://i.pravatar.cc/150?u=homefix"
      },
      {
        name: "Ustad Ramzan Carpenter",
        phone: "0344-7778800",
        category: "carpenter",
        specialty: "Custom furniture, kitchen cabinets, wardrobe design.",
        locationText: "G-11, Islamabad",
        latitude: 33.6800, longitude: 73.0450,
        hourlyRate: 1500, availabilityStatus: "available",
        isVerified: true, yearsExperience: 20, totalJobsDone: 1500,
        avatarUrl: "https://i.pravatar.cc/150?u=ramzan_carp"
      },
      {
        name: "Asif Wood Works",
        phone: "0315-3332211",
        category: "carpenter",
        specialty: "Basic shelf installation, door hinge repair, cheap furniture fixes.",
        locationText: "I-10, Islamabad",
        latitude: 33.6750, longitude: 73.0200,
        hourlyRate: 500, availabilityStatus: "available",
        isVerified: false, yearsExperience: 3, totalJobsDone: 55,
        avatarUrl: "https://i.pravatar.cc/150?u=asif_wood"
      },

      // ── PAINTERS (3) ──────────────────────────────
      {
        name: "Ali Paints & Decor",
        phone: "0300-2223344",
        category: "painter",
        specialty: "Interior wall painting, texture work, ceiling design.",
        locationText: "F-8, Islamabad",
        latitude: 33.7100, longitude: 73.0350,
        hourlyRate: 1000, availabilityStatus: "available",
        isVerified: true, yearsExperience: 7, totalJobsDone: 300,
        avatarUrl: "https://i.pravatar.cc/150?u=ali_paint"
      },
      {
        name: "Kamran Budget Painter",
        phone: "0312-5556677",
        category: "painter",
        specialty: "Quick room painting, whitewash, basic wall repair.",
        locationText: "G-9, Islamabad",
        latitude: 33.6960, longitude: 73.0420,
        hourlyRate: 400, availabilityStatus: "available",
        isVerified: false, yearsExperience: 2, totalJobsDone: 45,
        avatarUrl: "https://i.pravatar.cc/150?u=kamran_paint"
      },
      {
        name: "Master Painters Islamabad",
        phone: "0333-1114455",
        category: "painter",
        specialty: "Full house painting, exterior coating, waterproofing.",
        locationText: "DHA Phase 2, Islamabad",
        latitude: 33.5300, longitude: 73.1050,
        hourlyRate: 1800, availabilityStatus: "available",
        isVerified: true, yearsExperience: 14, totalJobsDone: 700,
        avatarUrl: "https://i.pravatar.cc/150?u=master_paint"
      },

      // ── CLEANERS (3) ──────────────────────────────
      {
        name: "Sparkle Home Cleaning",
        phone: "0345-6667788",
        category: "cleaner",
        specialty: "Deep house cleaning, sofa washing, carpet shampooing.",
        locationText: "F-11, Islamabad",
        latitude: 33.6900, longitude: 73.0200,
        hourlyRate: 800, availabilityStatus: "available",
        isVerified: true, yearsExperience: 5, totalJobsDone: 250,
        avatarUrl: "https://i.pravatar.cc/150?u=sparkle_clean"
      },
      {
        name: "Quick Clean Services",
        phone: "0300-7778899",
        category: "cleaner",
        specialty: "Basic room cleaning, kitchen cleaning, bathroom scrub.",
        locationText: "G-10, Islamabad",
        latitude: 33.6900, longitude: 73.0530,
        hourlyRate: 350, availabilityStatus: "available",
        isVerified: false, yearsExperience: 1, totalJobsDone: 30,
        avatarUrl: "https://i.pravatar.cc/150?u=quick_clean"
      },
      {
        name: "Pro Clean Islamabad",
        phone: "0321-4445500",
        category: "cleaner",
        specialty: "Office deep clean, post-construction cleanup, fumigation.",
        locationText: "Blue Area, Islamabad",
        latitude: 33.7210, longitude: 73.0610,
        hourlyRate: 1500, availabilityStatus: "available",
        isVerified: true, yearsExperience: 8, totalJobsDone: 400,
        avatarUrl: "https://i.pravatar.cc/150?u=pro_clean"
      },

      // ── TUTORS (3) ──────────────────────────────
      {
        name: "Al-Madina Tutors",
        phone: "0334-9998888",
        category: "tutor",
        specialty: "Maths and Physics tutoring for O/A levels.",
        locationText: "G-11, Islamabad",
        latitude: 33.6795, longitude: 73.0427,
        hourlyRate: 2000, availabilityStatus: "available",
        isVerified: false, yearsExperience: 3, totalJobsDone: 50,
        avatarUrl: "https://i.pravatar.cc/150?u=almadina"
      },
      {
        name: "Sir Kashif Academy",
        phone: "0311-3332211",
        category: "tutor",
        specialty: "MDCAT/ECAT prep, Biology and Chemistry expert.",
        locationText: "F-7, Islamabad",
        latitude: 33.7190, longitude: 73.0430,
        hourlyRate: 3000, availabilityStatus: "available",
        isVerified: true, yearsExperience: 10, totalJobsDone: 350,
        avatarUrl: "https://i.pravatar.cc/150?u=kashif_tutor"
      },
      {
        name: "Budget Home Tutor",
        phone: "0300-1119988",
        category: "tutor",
        specialty: "Primary school all subjects, Quran reading, basic English.",
        locationText: "I-10, Islamabad",
        latitude: 33.6760, longitude: 73.0210,
        hourlyRate: 800, availabilityStatus: "available",
        isVerified: false, yearsExperience: 2, totalJobsDone: 25,
        avatarUrl: "https://i.pravatar.cc/150?u=budget_tutor"
      },

      // ── BEAUTICIANS (3) ──────────────────────────────
      {
        name: "Nisa Beauty Salon (At Home)",
        phone: "0322-3334444",
        category: "beautician",
        specialty: "Bridal makeup, party makeup, hair styling at your doorstep.",
        locationText: "DHA, Islamabad",
        latitude: 33.5271, longitude: 73.1062,
        hourlyRate: 3000, availabilityStatus: "available",
        isVerified: true, yearsExperience: 7, totalJobsDone: 300,
        avatarUrl: "https://i.pravatar.cc/150?u=nisa"
      },
      {
        name: "Sana Home Beauty",
        phone: "0345-2221100",
        category: "beautician",
        specialty: "Mehndi, facial, waxing, threading at home.",
        locationText: "G-13, Islamabad",
        latitude: 33.6600, longitude: 73.0230,
        hourlyRate: 1000, availabilityStatus: "available",
        isVerified: false, yearsExperience: 3, totalJobsDone: 80,
        avatarUrl: "https://i.pravatar.cc/150?u=sana_beauty"
      },
      {
        name: "Glamour Studio Mobile",
        phone: "0333-9990011",
        category: "beautician",
        specialty: "Professional bridal packages, HD makeup, nail art.",
        locationText: "F-6, Islamabad",
        latitude: 33.7250, longitude: 73.0300,
        hourlyRate: 5000, availabilityStatus: "available",
        isVerified: true, yearsExperience: 12, totalJobsDone: 600,
        avatarUrl: "https://i.pravatar.cc/150?u=glamour_studio"
      },
    ]).returning({ id: providers.id });

    console.log(`Inserted ${insertedProviders.length} providers.`);

    console.log("Seeding reviews...");
    // Build reviews — indices match insertion order above
    const r = insertedProviders;
    await db.insert(reviews).values([
      // Electrician 1 (Ahmed)
      { providerId: r[0].id, reviewerName: "Ali K.", rating: 5, comment: "Fixed my fan in 30 mins! Very professional." },
      { providerId: r[0].id, reviewerName: "Sara", rating: 4, comment: "Good work but arrived 10 mins late." },
      { providerId: r[0].id, reviewerName: "Hamza", rating: 5, comment: "UPS wiring done perfectly." },
      // Electrician 2 (Zain)
      { providerId: r[1].id, reviewerName: "Company X", rating: 5, comment: "Did the entire office wiring perfectly." },
      { providerId: r[1].id, reviewerName: "Farhan", rating: 5, comment: "3-phase connection done same day." },
      { providerId: r[1].id, reviewerName: "Nadia", rating: 4, comment: "Expensive but top quality work." },
      // Electrician 3 (Bilal Budget)
      { providerId: r[2].id, reviewerName: "Waqas", rating: 3, comment: "Got the job done cheaply but wiring was messy." },
      { providerId: r[2].id, reviewerName: "Tariq", rating: 4, comment: "Good for basic fixes at a low price." },
      // Electrician 4 (Imran Solar)
      { providerId: r[3].id, reviewerName: "Asad", rating: 5, comment: "Solar panels installed flawlessly." },
      { providerId: r[3].id, reviewerName: "Rizwan", rating: 5, comment: "Inverter setup saved us money on bills." },
      // Electrician 5 (Shahid)
      { providerId: r[4].id, reviewerName: "Umar", rating: 4, comment: "Fixed short circuit quickly at night." },
      { providerId: r[4].id, reviewerName: "Kashif", rating: 4, comment: "Emergency call par aaye, acha kaam kiya." },
      // Plumber 1 (Bismillah)
      { providerId: r[5].id, reviewerName: "Usman", rating: 4, comment: "Fixed the geyser leak quickly." },
      { providerId: r[5].id, reviewerName: "Zahra", rating: 5, comment: "Polite and efficient plumber." },
      { providerId: r[5].id, reviewerName: "Ahmed R.", rating: 5, comment: "12 saal ka experience dikhta hai kaam mein." },
      // Plumber 2 (Rana)
      { providerId: r[6].id, reviewerName: "Salman", rating: 5, comment: "Bathroom renovation was beautiful." },
      { providerId: r[6].id, reviewerName: "Hina", rating: 4, comment: "Good quality pipes used." },
      // Plumber 3 (Aslam Quick)
      { providerId: r[7].id, reviewerName: "Junaid", rating: 3, comment: "Sasta kaam hai lekin quality average." },
      { providerId: r[7].id, reviewerName: "Noman", rating: 3, comment: "Tap fixed but leaked again after 2 weeks." },
      // Plumber 4 (Haji)
      { providerId: r[8].id, reviewerName: "Irfan", rating: 5, comment: "Water tank installation done perfectly." },
      { providerId: r[8].id, reviewerName: "Bilal S.", rating: 5, comment: "Best plumber in Islamabad. 20 years experience." },
      { providerId: r[8].id, reviewerName: "Amna", rating: 5, comment: "Underground piping done without any mess." },
      // Plumber 5 (Faisal)
      { providerId: r[9].id, reviewerName: "Sohail", rating: 4, comment: "Drain cleaned properly." },
      // AC 1 (Cool Tech)
      { providerId: r[10].id, reviewerName: "Kamran", rating: 5, comment: "AC is freezing cold now. Highly recommended." },
      { providerId: r[10].id, reviewerName: "Omer", rating: 5, comment: "Very clean work during gas refill." },
      // AC 2 (Tariq)
      { providerId: r[11].id, reviewerName: "Bilal", rating: 4, comment: "DC inverter fixed well." },
      { providerId: r[11].id, reviewerName: "Saima", rating: 4, comment: "Acha kaam karta hai ye banda." },
      // AC 3 (Nadeem)
      { providerId: r[12].id, reviewerName: "Waseem", rating: 3, comment: "Window AC repair okay but slow." },
      // AC 4 (Royal)
      { providerId: r[13].id, reviewerName: "Corp Office", rating: 5, comment: "Central AC system installed for entire floor." },
      { providerId: r[13].id, reviewerName: "Malik", rating: 5, comment: "Premium service, worth the price." },
      // AC 5 (Sajid Budget)
      { providerId: r[14].id, reviewerName: "Kashif", rating: 3, comment: "Gas refill done but AC still not cold enough." },
      // Carpenter 1 (Home Fix)
      { providerId: r[15].id, reviewerName: "Ayesha", rating: 4, comment: "Fixed my wardrobe door neatly." },
      // Carpenter 2 (Ramzan)
      { providerId: r[16].id, reviewerName: "Adeel", rating: 5, comment: "Custom kitchen cabinets are amazing quality." },
      { providerId: r[16].id, reviewerName: "Sadia", rating: 5, comment: "20 saal ka tajurba dikhta hai. Master craftsman." },
      // Carpenter 3 (Asif)
      { providerId: r[17].id, reviewerName: "Naveed", rating: 3, comment: "Shelf lagaya lekin thoda teda hai." },
      // Painter 1 (Ali)
      { providerId: r[18].id, reviewerName: "Zubair", rating: 5, comment: "Texture work on bedroom walls is beautiful." },
      { providerId: r[18].id, reviewerName: "Mahira", rating: 4, comment: "Clean work, covered furniture properly." },
      // Painter 2 (Kamran)
      { providerId: r[19].id, reviewerName: "Shehzad", rating: 3, comment: "Sasta paint use kiya but overall OK." },
      // Painter 3 (Master)
      { providerId: r[20].id, reviewerName: "Imran K.", rating: 5, comment: "Full house exterior done. Looks brand new." },
      { providerId: r[20].id, reviewerName: "Farah", rating: 5, comment: "Waterproofing saved us from leaks this monsoon." },
      // Cleaner 1 (Sparkle)
      { providerId: r[21].id, reviewerName: "Rehan", rating: 5, comment: "Deep cleaned entire house. Spotless!" },
      { providerId: r[21].id, reviewerName: "Amina", rating: 4, comment: "Sofa washing came out great." },
      // Cleaner 2 (Quick Clean)
      { providerId: r[22].id, reviewerName: "Saad", rating: 3, comment: "Basic clean. You get what you pay for." },
      // Cleaner 3 (Pro Clean)
      { providerId: r[23].id, reviewerName: "Office Manager", rating: 5, comment: "Post-construction cleanup was thorough." },
      { providerId: r[23].id, reviewerName: "Builder Co.", rating: 5, comment: "Professional team, came with equipment." },
      // Tutor 1 (Al-Madina)
      { providerId: r[24].id, reviewerName: "Student", rating: 5, comment: "Helped me get an A in Physics!" },
      // Tutor 2 (Sir Kashif)
      { providerId: r[25].id, reviewerName: "MDCAT Student", rating: 5, comment: "Got 190+ in MDCAT. Sir Kashif is the best!" },
      { providerId: r[25].id, reviewerName: "Parent", rating: 5, comment: "My daughter scored top marks thanks to his teaching." },
      // Tutor 3 (Budget)
      { providerId: r[26].id, reviewerName: "Mother", rating: 4, comment: "Good for primary school kids." },
      // Beautician 1 (Nisa)
      { providerId: r[27].id, reviewerName: "Fatima", rating: 5, comment: "Amazing bridal makeup and very punctual." },
      { providerId: r[27].id, reviewerName: "Hira", rating: 5, comment: "Party makeup was gorgeous!" },
      // Beautician 2 (Sana)
      { providerId: r[28].id, reviewerName: "Asma", rating: 4, comment: "Good mehndi design at reasonable price." },
      // Beautician 3 (Glamour)
      { providerId: r[29].id, reviewerName: "Bride", rating: 5, comment: "HD bridal makeup was flawless. Worth every rupee." },
      { providerId: r[29].id, reviewerName: "Sana K.", rating: 5, comment: "Professional setup, brought full studio to home." },
    ]);

    console.log("Database seeded successfully! 🎉");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
  process.exit(0);
}

seed();
