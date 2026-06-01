UPDATE exhibits
SET thumbnail_url = 'https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/The%20Starry%20Night.jpg'
WHERE title LIKE '%Starry Night%' AND (thumbnail_url IS NULL OR thumbnail_url != 'https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/The%20Starry%20Night.jpg');

COMMIT;
