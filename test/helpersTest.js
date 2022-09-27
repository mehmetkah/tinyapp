const { assert } = require("chai");

const {
  generateRandomString,
  urlsForUser,
  getUserByEmail,
  cookieHasUser,
} = require("../helper");

const testUsers = {
  user1: {
    id: "user1",
    email: "user1@test.com",
    password: "purple-monkey-dinosaur",
  },
  user2: {
    id: "user2",
    email: "user2@test.com",
    password: "blue-chimp-trex",
  },
};

const testUrlDatabase = {
  bfjqot: {
    longUrl: "http://www.lighthouselabs.ca",
    userID: "user1",
  },
  htlams: {
    longUrl: "http://www.google.com",
    userID: "user1",
  },
  mjqcht: {
    longUrl: "http://www.fenerbahce.com",
    userID: "user2",
  },
};

describe("generateRandomString", function () {
  it("should return a string with six characters", function () {
    const randomStringLength = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(randomStringLength, expectedOutput);
  });

  it("should not return the same string when called multiple times", function () {
    const firstRandomString = generateRandomString();
    const secondRandomString = generateRandomString();
    assert.notEqual(firstRandomString, secondRandomString);
  });
});

describe("getUserByEmail", function () {
  it("should return true if email corresponds to a user in the database", function () {
    const existingEmail = getUserByEmail("user1@example.com", testUsers);
    const expectedOutput = true;
    assert.equal(existingEmail, expectedOutput);
  });

  it("should return false if email does not correspond to a user in the database", function () {
    const nonExistantEmail = getUserByEmail("sessiz_gece@gmail.com", testUsers);
    const expectedOutput = false;
    assert.equal(nonExistantEmail, expectedOutput);
  });
});

describe("urlsForUser", function () {
  it("should return an object of url information specific to the given user ID", function () {
    const specificUrls = urlsForUser("user1RandomID", testUrlDatabase);
    const expectedOutput = {
      bfjqot: {
        longUrl: "http://www.lighthouselabs.ca",
        userID: "user1RandomID",
      },
      htlams: {
        longUrl: "http://www.google.com",
        userID: "user1RandomID",
      },
    };
    assert.deepEqual(specificUrls, expectedOutput);
  });

  it("should return an empty object if no urls exist for a given user ID", function () {
    const noSpecificUrls = urlsForUser("fakeUser", testUrlDatabase);
    const expectedOutput = {};
    assert.deepEqual(noSpecificUrls, expectedOutput);
  });
});

describe("cookieHasUser", function () {
  it("should return true if a cookie corresponds to a user in the database", function () {
    const existingCookie = cookieHasUser("user1RandomID", testUsers);
    const expectedOutput = true;
    assert.equal(existingCookie, expectedOutput);
  });

  it("should return false if a cookie does not correspond to a user in the database", function () {
    const nonExistantCookie = cookieHasUser("user3RandomID", testUsers);
    const expectedOutput = false;
    assert.equal(nonExistantCookie, expectedOutput);
  });
});
