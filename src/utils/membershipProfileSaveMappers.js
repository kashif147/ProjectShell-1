import dayjs from "dayjs";

/**
 * @param {unknown} val dayjs, Date, ISO string, or nullish
 * @returns {string|null}
 */
export function toIsoDate(val) {
  if (val == null || val === "") return null;
  if (dayjs.isDayjs(val)) {
    return val.isValid() ? val.toISOString() : null;
  }
  const d = dayjs(val);
  return d.isValid() ? d.toISOString() : null;
}

/**
 * Build PUT /profile/:profileId body from MembershipForm state.
 * @param {Record<string, unknown>} formData
 * @param {Record<string, unknown>|null|undefined} profileDetails
 */
export function formDataToProfilePutPayload(formData, profileDetails) {
  const preferredAddress =
    formData.preferredAddress === "Home/Personal" ? "home" : "work";
  const preferredEmail =
    formData.preferredEmail === "Work" ? "work" : "personal";

  const genderRaw = formData.gender;
  const gender =
    typeof genderRaw === "string" && genderRaw.trim()
      ? genderRaw.trim().toLowerCase()
      : "";

  return {
    personalInfo: {
      title: formData.title || "",
      surname: formData.surname || "",
      forename: formData.forename || "",
      gender,
      dateOfBirth: toIsoDate(formData.dateOfBirth),
      countryPrimaryQualification: formData.countryPrimaryQualification || "",
      deceased: Boolean(formData.isDeceased),
      deceasedDate: formData.isDeceased
        ? toIsoDate(formData.dateDeceased)
        : null,
    },
    contactInfo: {
      nATA: Boolean(formData.nata),
      preferredAddress,
      buildingOrHouse: formData.addressLine1 || "",
      streetOrRoad: formData.addressLine2 || "",
      areaOrTown: formData.townCity || "",
      eircode: formData.eircode || "",
      countyCityOrPostCode: formData.countyState || "",
      country: formData.country || "",
      mobileNumber: formData.mobileNumber || "",
      telephoneNumber: formData.telephoneNumber || "",
      preferredEmail,
      personalEmail: formData.personalEmail || "",
      workEmail: formData.workEmail || "",
    },
    professionalDetails: {
      retiredDate: toIsoDate(formData.retiredDate),
      pensionNo: formData.pensionNumber || "",
      studyLocation: formData.studyLocation || "",
      startDate: toIsoDate(formData.startDate),
      graduationDate: toIsoDate(formData.graduationDate),
      discipline: formData.discipline || "",
      workLocation: formData.workLocation || "",
      payrollNo: formData.payrollNumber || "",
      otherWorkLocation: formData.otherWorkLocation || null,
      branch: formData.branch || "",
      region: formData.region || "",
      grade: formData.grade || "",
      otherGrade: formData.otherGrade || null,
      primarySection: formData.primarySection || "",
      otherPrimarySection: formData.otherPrimarySection || null,
      secondarySection: formData.secondarySection || "",
      otherSecondarySection: formData.otherSecondarySection || null,
      nursingAdaptationProgramme: formData.nursingProgramme === "Yes",
      nmbiNumber: formData.nmbiNumber || "",
      nurseType: formData.nursingSpecialization || "",
    },
    preferences: {
      consent: Boolean(formData.consent),
      smsConsent: Boolean(formData.consentSMS),
      emailConsent: Boolean(formData.consentEmail),
      postalConsent: Boolean(formData.consentPost),
      appConsent: Boolean(formData.consentApp),
      valueAddedServices: Boolean(formData.valueAddedServices),
      termsAndConditions: Boolean(formData.agreeDataProtection),
    },
    cornMarket: {
      inmoRewards: Boolean(formData.joinRewards),
      exclusiveDiscountsAndOffers: Boolean(
        formData.exclusiveDiscountsOffers
      ),
      incomeProtectionScheme: Boolean(formData.joinINMOIncomeProtection),
    },
    additionalInformation: {
      membershipStatus:
        formData.membershipStatus ||
        profileDetails?.additionalInformation?.membershipStatus ||
        "active",
      otherIrishTradeUnion: formData.memberOfOtherUnion === "Yes",
      otherIrishTradeUnionName:
        formData.memberOfOtherUnion === "Yes"
          ? formData.otherUnionName || null
          : null,
      otherScheme: formData.otherUnionScheme === "Yes",
    },
    recruitmentDetails: {
      recuritedBy: formData.recruitedBy || "",
      recuritedByMembershipNo: formData.recruitedByMembershipNo || "",
      confirmedRecruiterProfileId:
        profileDetails?.recruitmentDetails?.confirmedRecruiterProfileId ??
        null,
    },
  };
}

/**
 * Partial PUT body mirroring subscription GET document shape.
 * @param {Record<string, unknown>} formData
 * @param {Record<string, unknown>|null|undefined} currentSubscription
 */
export function formDataToSubscriptionPutPayload(
  formData,
  currentSubscription
) {
  const prevPref = currentSubscription?.preferences || {};
  const prevProf = currentSubscription?.professionalDetails || {};

  const fullAddress = [
    formData.addressLine1,
    formData.addressLine2,
    formData.townCity,
    formData.countyState,
    formData.eircode,
    formData.country,
  ]
    .filter((p) => p != null && String(p).trim() !== "")
    .join(", ");

  return {
    membershipCategory: formData.membershipCategory,
    paymentType: formData.paymentType,
    payrollNo: formData.payrollNumber,
    paymentFrequency: formData.paymentFrequency,
    membershipMovement: formData.membershipMovement,
    startDate: toIsoDate(formData.startDate),
    endDate: toIsoDate(formData.endDate),
    rolloverDate: toIsoDate(formData.renewalDate),
    personalDetails: {
      membershipNo: formData.membershipNumber || null,
      mobileNo: formData.mobileNumber || null,
      dateOfBirth: toIsoDate(formData.dateOfBirth),
      gender: formData.gender || null,
      fullAddress: fullAddress || null,
      notAtThisAddress: Boolean(formData.nata),
    },
    professionalDetails: {
      workLocation: formData.workLocation || null,
      branch: formData.branch || null,
      region: formData.region || null,
      grade: formData.grade || null,
      primarySection: formData.primarySection || null,
      secondarySection: formData.secondarySection || null,
      nmbiNumber: formData.nmbiNumber || null,
      retiredDate: toIsoDate(formData.retiredDate),
      pensionNumber: formData.pensionNumber ?? prevProf.pensionNumber ?? null,
      speciality: prevProf.speciality ?? null,
    },
    preferences: {
      consent: Boolean(formData.consent),
      incomeProtection: Boolean(formData.joinINMOIncomeProtection),
      inmoRewards: Boolean(formData.joinRewards),
      partnerConsent: Boolean(prevPref.partnerConsent),
    },
    additionalInfo: {
      anotherUnionMember: formData.memberOfOtherUnion === "Yes",
      otherUnionName:
        formData.memberOfOtherUnion === "Yes"
          ? formData.otherUnionName || ""
          : "",
    },
  };
}
