-- Default jewellery categories (admin can edit, reorder or delete these).
insert into public.categories (name, slug, description, sort_order) values
  ('American Diamond Jewellery', 'american-diamond-jewellery', 'Sparkling American Diamond (CZ) necklace sets, earrings and bangles for every occasion.', 1),
  ('Victorian Jewellery', 'victorian-jewellery', 'Ornate Victorian-style designs with rich finishes and intricate detailing.', 2),
  ('Heritage Jewellery', 'heritage-jewellery', 'Timeless heritage designs inspired by traditional Indian craftsmanship.', 3),
  ('South Indian Jewellery', 'south-indian-jewellery', 'Temple-inspired and classic South Indian designs.', 4),
  ('Bridal Jewellery', 'bridal-jewellery', 'Complete bridal sets crafted for weddings and celebrations.', 5),
  ('Necklace Sets', 'necklace-sets', 'Necklace sets with matching earrings in a wide range of styles.', 6),
  ('Earrings', 'earrings', 'Studs, jhumkas, drops and statement earrings.', 7),
  ('Bangles', 'bangles', 'Bangles and kadas in single pieces and sets.', 8),
  ('Latest Designs', 'latest-designs', 'Our newest designs, added regularly.', 9)
on conflict (slug) do nothing;
