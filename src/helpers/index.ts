export const throttleWithTrailing = <T extends (...args: any[]) => void>(
  func: T, // ფუნქცია რომელსაც ვაკონტროლებთ
  limit: number, // დროის ლიმიტი მილიწამებში
): T => {
  // შიდა ცვლადები მდგომარეობის სამართავად
  let lastCallTime = 0; // ბოლო გამოძახების დრო
  let timeoutId: ReturnType<typeof setTimeout> | null = null; // timeout-ის ID
  let lastArgs: any[] | null = null; // ბოლო არგუმენტების კეში

  // დაბრუნებული wrapper ფუნქცია
  return function (this: any, ...args: any[]) {
    const now = Date.now(); // მიმდინარე დრო
    const remaining = limit - (now - lastCallTime); // დარჩენილი დრო
    lastArgs = args; // შევინახოთ არგუმენტები

    if (remaining <= 0) {
      // თუ ლიმიტი გავიდა
      if (timeoutId) clearTimeout(timeoutId); // გავაუქმოთ დაგეგმილი გამოძახება
      lastCallTime = now; // განვაახლოთ ბოლო გამოძახების დრო
      func.apply(this, args); // გამოვიძახოთ ფუნქცია
    } else if (!timeoutId) {
      // თუ ლიმიტი არ გასულა და არ გვაქვს დაგეგმილი გამოძახება
      timeoutId = setTimeout(() => {
        // დავგეგმოთ გამოძახება
        lastCallTime = Date.now();
        if (lastArgs) func.apply(this, lastArgs);
        lastArgs = null;
      }, remaining);
    }
  } as T; // ტიპის კასტი უკან T-ზე
};
