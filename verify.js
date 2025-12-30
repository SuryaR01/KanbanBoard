// Using built-in fetch

async function verify() {
  try {
    // 1. Create Item
    const createRes = await fetch("http://localhost:3000/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Verification Item",
        price: 123,
        image: "https://example.com/img.jpg",
        description: "Verified Description",
        quantity: 50
      })
    });
    const createdItem = await createRes.json();
    console.log("Created Item:", createdItem);

    // 2. Fetch Item
    const getRes = await fetch(`http://localhost:3000/api/items/${createdItem._id}`);
    const fetchedItem = await getRes.json();
    console.log("Fetched Item:", fetchedItem);

    if (fetchedItem.description === "Verified Description" && fetchedItem.quantity === 50) {
        console.log("SUCCESS: Fields verified.");
    } else {
        console.log("FAILURE: Fields missing or incorrect.");
    }

  } catch (e) {
    console.error("Error:", e);
  }
}

verify();
