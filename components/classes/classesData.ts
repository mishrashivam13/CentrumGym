export type GymClass = {
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  trainerDesc: string;
  image: string;
  duration: string;
  level: string;
  trainer: string;
};

export const gymClasses: GymClass[] = [
  {
    slug: "body-building",
    name: "Body Building",
    shortDesc: "Transform your physique with structured weight training and nutrition.",
    description:
      "Our body building program is designed for those who want to transform their physique through structured weight training and nutrition. We help you build muscle mass effectively with programs tailored to your body type and goals. Whether you're preparing for a competition or just want to look your best, our body building program will help you achieve your goals with proper form and technique.",
    trainerDesc:
      "Our certified trainers have extensive experience in body building. They will guide you through proper lifting techniques, help you avoid common injuries, and create customized workout plans based on your body type and goals. With a holistic approach to muscle building, our trainers ensure safe and steady progress.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80",
    duration: "60 min",
    level: "All Levels",
    trainer: "Rahul Sharma",
  },
  {
    slug: "cardio",
    name: "Cardio",
    shortDesc: "Boost your endurance and burn calories with high-energy cardio sessions.",
    description:
      "Our cardio classes are designed to improve cardiovascular fitness, burn fat, and increase your overall stamina. Through a mix of aerobic exercises, interval training, and fun routines, you will torch calories while improving your heart health. Suitable for all fitness levels, our cardio sessions are energizing and effective.",
    trainerDesc:
      "Our cardio instructors are certified fitness professionals who specialize in keeping your heart rate in the optimal fat-burning zone. They design sessions that are challenging yet enjoyable, ensuring you stay motivated and see consistent results week after week.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80",
    duration: "45 min",
    level: "Beginner – Intermediate",
    trainer: "Priya Singh",
  },
  {
    slug: "yoga",
    name: "Yoga",
    shortDesc: "Find balance, flexibility, and mental clarity through yoga.",
    description:
      "Our yoga program blends traditional asanas with modern fitness principles to improve flexibility, balance, and mental wellness. Whether you are a complete beginner or an experienced practitioner, our classes will help you build core strength, reduce stress, and enhance your overall sense of well-being through mindful movement and breathwork.",
    trainerDesc:
      "Our certified yoga instructors bring years of practice and teaching experience to every session. They guide you through proper alignment, breathing techniques, and modifications so every student — regardless of experience level — gets the most out of each class.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=80",
    duration: "60 min",
    level: "All Levels",
    trainer: "Anita Verma",
  },
  {
    slug: "weight-training",
    name: "Weight Training",
    shortDesc: "Build strength and power with guided free weights and machine training.",
    description:
      "Our weight training program focuses on building functional strength using free weights, barbells, dumbbells, and machines. Each session is structured to progressively overload your muscles, helping you gain strength, improve posture, and boost metabolism. Our trainers ensure correct form at every step to maximize results and minimize injury risk.",
    trainerDesc:
      "Our strength coaches hold national certifications and have worked with athletes, beginners, and senior members alike. They will assess your current strength levels, design a progressive program, and coach you through every set with precision.",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&q=80",
    duration: "60 min",
    level: "Intermediate – Advanced",
    trainer: "Vikram Joshi",
  },
  {
    slug: "boxing",
    name: "Boxing",
    shortDesc: "Learn combat techniques while getting a full-body workout.",
    description:
      "Our boxing classes combine technique, agility, and conditioning for one of the most complete full-body workouts available. You will learn proper stance, footwork, punching combinations, and defensive movements — all while burning serious calories and building mental toughness. No prior experience needed.",
    trainerDesc:
      "Coached by trained boxing professionals with competitive experience, our instructors break down every technique for beginners while challenging advanced students to sharpen their skills. Safety and proper form are always the top priority.",
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=900&q=80",
    duration: "60 min",
    level: "All Levels",
    trainer: "Arjun Meena",
  },
  {
    slug: "zumba",
    name: "Zumba",
    shortDesc: "Dance your way to fitness with high-energy Zumba sessions.",
    description:
      "Zumba at Centrum Gym turns exercise into a celebration. Our sessions combine Latin and international music with dance moves to create an exhilarating, calorie-burning workout. It is the class that does not feel like exercise — you will be too busy having fun to notice how hard you are working. Perfect for all ages and fitness levels.",
    trainerDesc:
      "Our licensed Zumba instructors bring infectious energy and expert choreography to every class. They make it easy for first-timers to follow along while keeping regulars engaged with fresh routines and high-energy music.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=80",
    duration: "45 min",
    level: "All Levels",
    trainer: "Sonia Kapoor",
  },
  {
    slug: "hiit",
    name: "HIIT",
    shortDesc: "Maximum calorie burn in minimum time with high-intensity intervals.",
    description:
      "High-Intensity Interval Training (HIIT) at Centrum Gym delivers maximum results in minimum time. Alternating between intense bursts of activity and short recovery periods, HIIT sessions elevate your metabolism for hours after the class ends. It is the most time-efficient way to burn fat, build endurance, and improve cardiovascular health.",
    trainerDesc:
      "Our HIIT coaches are experts in designing interval-based programs that push your limits safely. They scale every workout to your fitness level, ensuring both beginners and advanced athletes get an equally challenging and effective session.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80",
    duration: "30 min",
    level: "Intermediate – Advanced",
    trainer: "Deepak Rao",
  },
  {
    slug: "functional-training",
    name: "Functional Training",
    shortDesc: "Train movements that matter for real-life strength and mobility.",
    description:
      "Functional training focuses on exercises that mimic real-world movements — pushing, pulling, squatting, hinging, and carrying. Our classes build practical strength, improve coordination, and enhance mobility, reducing the risk of everyday injuries. This program is ideal for anyone looking to move better and feel stronger in daily life.",
    trainerDesc:
      "Our functional training specialists design programs using kettlebells, resistance bands, TRX, and bodyweight exercises. They focus on movement quality over quantity, ensuring your body learns to work as an integrated system for maximum efficiency and longevity.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80",
    duration: "50 min",
    level: "All Levels",
    trainer: "Kavita Nair",
  },
];

export const latestPosts = [
  {
    title: "5 Traditional Indian Foods That Boost Muscle Growth",
    date: "May 20, 2025",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&q=80",
  },
  {
    title: "Vegetarian Diet Plan for Bodybuilders",
    date: "May 15, 2025",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80",
  },
  {
    title: "Home Workouts Without Equipment",
    date: "May 5, 2025",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&q=80",
  },
  {
    title: "Recovery Techniques for Athletes",
    date: "Apr 28, 2025",
    image: "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=200&q=80",
  },
];
