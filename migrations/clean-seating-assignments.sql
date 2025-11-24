-- ============================================
-- Clean and Sync Seating Assignments - CSV ONLY
-- Generated: 2025-11-24T02:08:14.170Z
-- Total guests from CSV: 223
-- ============================================
-- 
-- WARNING: This will DELETE ALL existing records
-- and INSERT ONLY the 223 guests from the CSV
-- ============================================

BEGIN;

-- Step 1: Delete ALL existing seating assignments
DELETE FROM seating_assignments;

-- Step 2: Insert ONLY guests from CSV
INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Shane Quintanilla',
  'shane.quintanilla@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Kevin Leasiolagi & Kyra Leasiolagi',
  'kevin.kyra.leasiolagi@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'James Whippy',
  'james.whippy@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Teke Kaminaga & Julieann Kaminaga',
  'teke.julieann.kaminaga@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Ray Paul Jardon',
  'ray.paul.jardon@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Carter Young & Cristine Young',
  'carter.cristine.young@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Jesse Newby & Annaiea Newby',
  'jesse.annaiea.newby@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Jose Santos',
  'jose.santos@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Vincent Camacho & spouse',
  'vincent.camacho.spouse@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Carl Nangauta',
  'carl.nangauta@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Jassen Guerrero',
  'jassen.guerrero@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Amos Taijeron & spouse',
  'amos.taijeron.spouse@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'William Libby & Dana Libby',
  'william.dana.libby@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Devin Quitugua & Moana Quitugua',
  'devin.moana.quitugua@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Brandon Cepeda',
  'brandon.cepeda@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Derrick Wahl & Reynne Wahl',
  'derrick.reynne.wahl@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Neil Pang',
  'neil.pang@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'James Losongco',
  'james.losongco@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Jonathan Pablo',
  'jonathan.pablo@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Gavin Gamido',
  'gavin.gamido@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Camella Ramirez',
  'camella.ramirez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Christiana Ramirez',
  'christiana.ramirez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Tammy Ramirez',
  'tammy.ramirez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Nisha Chargualaf',
  'nisha.chargualaf@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '+1, WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Elizabeth Valencia',
  'elizabeth.valencia@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Audrey Benavente +1',
  'audrey.benavente.1@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '+1, WeddingParty'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Aika Sugahara',
  'aika.sugahara@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Alan Pacheco',
  'alan.pacheco@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Albert M. Perez',
  'albert.perez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Ann C. Taitano',
  'ann.c.taitano@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'Auntie / Marota Ana Taitano'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Annette A. Camacho',
  'annette.a.camacho@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Anthony Bordallo',
  'anthony.bordallo@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Antonio Roberto',
  'antonio.roberto@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Arianna Auriana Taitano',
  'arianna.taitano@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Arlin Shisler & Esther Shisler',
  'arlin.esther.shisler@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Ashe Ramirez',
  'ashe.ramirez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Ashley',
  'ashley@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Auntie Mona',
  'auntie.mona@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Auntie Linda',
  'auntie.linda@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Austin Schwarz & Sarah Schwarz',
  'austin.sarah.schwarz@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '+1 child (3 total)'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Avery Taitano',
  'avery.taitano@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Ayuri Sugahara',
  'ayuri.sugahara@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Azaria Taitano',
  'azaria.taitano@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Bert Flores',
  'bert.flores@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Bill & Donna Speakman',
  'bill.donna.speakman@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Brian Weisenberger',
  'brian.weisenberger@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Brianne Preza-Haynes',
  'brianne.prezahaynes@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Brian Roberto & Dovana Roberto',
  'brian.dovana.roberto@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Bryan Limtiaco',
  'bryan.limtiaco@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Carol M. Perez',
  'carol.perez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Carol T. Somerfleck',
  'carol.t.somerfleck@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Carisa S.A. Baza',
  'carisa.sa.baza@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Charli-Paige Arceo',
  'charlipaige.arceo@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Charlotte Mandell',
  'charlotte.mandell@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Chris Perez',
  'chris.perez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Chris Wall & Brenda Wall',
  'chris.brenda.wall@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Christopher Rapadas',
  'christopher.rapadas@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Christopher Taitano',
  'christopher.taitano@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Crescentia P. Tenorio',
  'crescentia.p.tenorio@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Dakota Tomas',
  'dakota.tomas@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Daniel Somerfleck',
  'daniel.somerfleck@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'David Cassidy',
  'david.cassidy@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'David Weisenberger',
  'david.weisenberger@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Dawn Manglona',
  'dawn.manglona@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Declan Mandell',
  'declan.mandell@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Derek Mandell',
  'derek.mandell@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Desmond Mandell III',
  'desmond.mandell.iii@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Desmond Mandell Jr.',
  'desmond.mandell.jr@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Diana Manglona',
  'diana.manglona@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Diego Quiogue',
  'diego.quiogue@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Dominic Gadia',
  'dominic.gadia@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Dominic Roberto & Kiana Roberto',
  'dominic.kiana.roberto@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Donna Arceo',
  'donna.arceo@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Donna C. Perez',
  'donna.perez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Doris U. Perez',
  'doris.perez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Douglas Perez',
  'douglas.perez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Dustin Roberto & spouse',
  'dustin.roberto.spouse@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Edeine L. Camacho',
  'edeine.l.camacho@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Elaine Roberto',
  'elaine.roberto@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Eli Somerfleck',
  'eli.somerfleck@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Enrique P. Pangelinan',
  'enrique.p.pangelinan@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Eric Mandell',
  'eric.mandell@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Eric Taitano & Tasha Taitano',
  'eric.tasha.taitano@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '+3 children (5 total)'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Ernee Perez',
  'ernee.perez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Esther Mendiola',
  'esther.mendiola@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Ezra Somerfleck',
  'ezra.somerfleck@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Felisa Baza',
  'felisa.baza@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Felix P. Camacho',
  'felix.p.camacho@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Frank Leon Guerrero',
  'frank.leon.guerrero@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Frank P. Arriola',
  'frank.p.arriola@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Frank P. Camacho',
  'frank.p.camacho@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Frank Roberto Santos',
  'frank.santos@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Fr. Mamangun',
  'fr.mamangun@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Fr. Paul Gofigan',
  'fr.paul.gofigan@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Gabriel',
  'gabriel@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Geri Mandell',
  'geri.mandell@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Geri Santos',
  'geri.santos@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Gia Ramos',
  'gia.ramos@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Gina M. Cura',
  'gina.m.cura@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Greg D. Perez',
  'greg.perez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Haig Huynh',
  'haig.huynh@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Hannah Mendiola & Kyle Mendiola',
  'hannah.mendiola.kyle.mendiola@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '+1 child (3 total)'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Heidi Chargualaf',
  'heidi.chargualaf@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Hunter Roberto',
  'hunter.roberto@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Ian Mariano',
  'ian.mariano@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Irie Taitano',
  'irie.taitano@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Isiah Weisenberger',
  'isiah.weisenberger@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Ita (Margarita B. Gay)',
  'ita.margarita.b.gay@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Jared Mendiola & spouse',
  'jared.mendiola.spouse@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Jay Cruz',
  'jay.cruz@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Jay Tomas',
  'jay.tomas@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Jadene T. Perez',
  'jadene.t.perez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'Jaydeen'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Jeremy Bato',
  'jeremy.bato@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Jeremy Flint & Diane Flint',
  'jeremy.diane.flint@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '+3 children (5 total)'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Joanne G. Camacho',
  'joanne.g.camacho@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Joe Hernandez',
  'joe.hernandez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'John Cruz & Vicky C. Cruz',
  'john.cruz@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'John D. Perez',
  'john.d.perez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'John M. Weisenberger (Jack)',
  'john.m.weisenberger.jack@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'John Weisenberger',
  'john.weisenberger@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Johnny Arceo',
  'johnny.arceo@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Johannes ______',
  'johannes@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Joseph Jude Perez (JJ)',
  'joseph.jude.perez.jj@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Joseph Mateo',
  'joseph.mateo@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Joseph Roberto & Annette Roberto',
  'joseph.annette.roberto@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '+1 child (3 total)'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Josiah Quiogue',
  'josiah.quiogue@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Journey Roberto',
  'journey.roberto@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Joyce Crisostomo',
  'joyce.crisostomo@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Joyce Tang',
  'joyce.tang@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Julie Ator',
  'julie.ator@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Julie M. Santos',
  'julie.santos@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Justin Aguigui & Justina Aguigui',
  'justin.justina.aguigui@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Kaleena C. Camacho',
  'kaleena.c.camacho@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Karen K. Perez',
  'karen.k.perez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Karl Shisler & Bernadette Shisler',
  'karl.bernadette.shisler@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Kaynad Bato',
  'kaynad.bato@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Keith Surber',
  'keith.surber@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Kuhaku',
  'kuhaku@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'KonaLu'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Larry Quintanilla & Lisa Quintanilla',
  'larry.lisa.quintanilla@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Leia Weisenberger',
  'leia.weisenberger@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Leonardo',
  'leonardo@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Les Smith & Colleen Smith',
  'les.colleen.smith@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Lourdes M. Perez',
  'lourdes.perez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Lourdes P. Camacho',
  'lourdes.p.camacho@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'Auntie Lou'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Luka Weisenberger',
  'luka.weisenberger@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Luke Weisenberger',
  'luke.weisenberger@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Manuel Roberto',
  'manuel.roberto@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Margaret M.P. Mandell',
  'margaret.mp.mandell@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'Baptismal Nina'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Margarita D. Bejado',
  'margarita.d.bejado@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Margarita P. Leon Guerrero',
  'margarita.p.leon.guerrero@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'Margie'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Mariah Ramos',
  'mariah.ramos@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Mariana Leon Guerrero',
  'mariana.leon.guerrero@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Marianito Bautista',
  'marianito.bautista@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'Uncle Nito'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Marianito Bautista Jr.',
  'marianito.bautista.jr@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Marque Arceo',
  'marque.arceo@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Mark Arceo & Jennifer Arceo',
  'mark.jennifer.arceo@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Mark Chargualaf',
  'mark.chargualaf@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Mark Cura',
  'mark.cura@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Marvin Mafnas',
  'marvin.mafnas@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Mary P. Camacho',
  'mary.p.camacho@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Mary P. Espinosa',
  'mary.p.espinosa@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Matthew Carter',
  'matthew.carter@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Mia Perez',
  'mia.perez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Michael Cura',
  'michael.cura@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Michael Cura Jr.',
  'michael.cura.jr@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  'Mikey'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Michael Roberto & Megan',
  'michael.roberto.megan@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Michael Taitano',
  'michael.taitano@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Michael Torres',
  'michael.torres@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Michelle San Nicolas',
  'michelle.san.nicolas@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Monique Amani & N''Dri Amani',
  'monique.amani.ndri.amani@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Mussie & Jasmin ______',
  'mussie.jasmin@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Nancy P. Pacheco',
  'nancy.p.pacheco@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Nora',
  'nora@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Pantime Chargualaf',
  'pantime.chargualaf@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Patrick Civille',
  'patrick.civille@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Peter P. Bautista',
  'peter.p.bautista@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Provence Mariano',
  'provence.mariano@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Ray Quiogue',
  'ray.quiogue@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Regina Gonzalez',
  'regina.gonzalez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Reid Ramos',
  'reid.ramos@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Rick P. Catindig',
  'rick.p.catindig@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Ricky Phillips & Hannah Phillips',
  'ricky.hannah.phillips@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Robert J. Torres',
  'robert.torres@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Roger Ramos',
  'roger.ramos@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Roland Quitugua & Heather Quitugua',
  'roland.heather.quitugua@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Ron Ramos',
  'ron.ramos@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Ron Schnabel',
  'ron.schnabel@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Rosie L. Bordallo',
  'rosie.l.bordallo@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Rudy Mendiola & Priscilla Mendiola',
  'rudy.priscilla.mendiola@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Rudy Roberto',
  'rudy.roberto@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Ryan Taitano',
  'ryan.taitano@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Ryan Young',
  'ryan.young@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Sage Roberto',
  'sage.roberto@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Sara & Dennis Doctor',
  'sara.dennis.doctor@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Shane Roberto & partner',
  'shane.roberto.partner@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '+1'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Shaniece Roberto & partner',
  'shaniece.roberto.partner@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '+2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Sherene Roberto',
  'sherene.roberto@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Shista Mandell',
  'shista.mandell@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Shista''s daughter',
  'shistas.daughter@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Shista''s son',
  'shistas.son@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Sierra Tomas',
  'sierra.tomas@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Sirena Cassidy',
  'sirena.cassidy@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Stephanie Bordallo',
  'stephanie.bordallo@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Sylvia Weisenberger',
  'sylvia.weisenberger@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Taiga Sugahara',
  'taiga.sugahara@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Tasha Taitano',
  'tasha.taitano@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Tatum Taitague',
  'tatum.taitague@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Taylor Taitague',
  'taylor.taitague@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Terry D. Perez',
  'terry.perez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Therese C. Schnabel',
  'therese.schnabel@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Thomas Roberto & Lisa Roberto',
  'thomas.lisa.roberto@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Timothy Roberto & Verlynn Roberto',
  'timothy.verlynn.roberto@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '+1 child (3 total)'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Tom D. Perez',
  'tom.perez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Tomisha Roberto',
  'tomisha.roberto@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Tony Bejado',
  'tony.bejado@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Tressie Perez',
  'tressie.perez@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Tristen Roberto & Hazel Roberto',
  'tristen.hazel.roberto@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Victor P. Camacho',
  'victor.p.camacho@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Vincent Camacho Sr.',
  'vincent.camacho.sr@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Wilfredo Espinosa',
  'wilfredo.espinosa@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'William Gibson',
  'william.gibson@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Zachary Camacho & Charrisse Camacho',
  'zachary.charrisse.camacho@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  '2'
);

INSERT INTO seating_assignments (
  guest_name,
  email,
  table_number,
  seat_number,
  plus_one_name,
  plus_one_seat,
  dietary_notes,
  special_notes
) VALUES (
  'Zebediah Howser',
  'zebediah.howser@pending.wedding',
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL
);

-- Verification query
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(DISTINCT table_number) as total_tables,
  COUNT(CASE WHEN table_number > 0 THEN 1 END) as assigned_guests,
  COUNT(CASE WHEN table_number = 0 THEN 1 END) as unassigned_guests
FROM seating_assignments;

COMMIT;

-- ============================================
-- Clean import complete!
-- Table now contains ONLY the 223 guests from CSV
-- ============================================

