#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod health_record {

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.

    // use ink_storage::collections::HashMap;
    use ink_storage::traits::{PackedLayout, SpreadLayout, SpreadAllocate};
    use ink_storage::Mapping;
    use ink_prelude::string::{String};
    use ink_prelude::vec::Vec;

    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[derive(Clone, Debug, scale::Encode, scale::Decode, SpreadLayout, PackedLayout, Default)]
    pub struct Patient{
        id: i32,
        names: String,
        date: String
    }

    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[derive(Clone, Debug, scale::Encode, scale::Decode, SpreadLayout, PackedLayout, Default)]
    pub struct HealthRecord{
        id: i32,
        patient_id: String,
        description: String,
        date: String
    }

    #[ink(storage)]
    #[derive(SpreadAllocate)]
    pub struct HealthRecordContract {
        /// Stores a single `bool` value on the storage.
        value: bool,
        health_records: Mapping<AccountId, Vec<HealthRecord>>,
        patients: Mapping<AccountId, Patient>,
    }

    impl HealthRecordContract {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new(init_value: bool) -> Self {
            ink_lang::utils::initialize_contract(|contract: &mut Self| {
                let caller = Self::env().caller();
                let health_record :HealthRecord = HealthRecord{
                    id: 1,
                    patient_id: "1".into(),
                    description: "conejo".into(),
                    date: "2022-08-24".into(),
                };
                let mut health_record_vec: Vec<HealthRecord> = Vec::new();
                health_record_vec.push(health_record);

                contract.value = init_value;
                contract.health_records.insert(&caller, &health_record_vec);
            })
            // Self { value: init_value }
        }

        /// Constructor that initializes the `bool` value to `false`.
        ///
        /// Constructors can delegate to other constructors.
        #[ink(constructor)]
        pub fn default() -> Self {
            ink_lang::utils::initialize_contract(|_| {})
        }

        /// A message that can be called on instantiated contracts.
        /// This one flips the value of the stored `bool` from `true`
        /// to `false` and vice versa.
        #[ink(message)]
        pub fn flip(&mut self) {
            self.value = !self.value;
        }

        /// Simply returns the current value of our `bool`.
        #[ink(message)]
        pub fn get(&self) -> bool {
            self.value
        }

        #[ink(message)]
        pub fn get_health_records(&self) -> Vec<HealthRecord> {
            let caller = Self::env().caller();
            self.health_records.get(&caller).unwrap_or_default()
        }

        #[ink(message)]
        pub fn add_health_record(&mut self, data :HealthRecord) {
            let caller = self.env().caller();
            let mut patient_health_records: Vec<HealthRecord> = self.get_health_records();
            patient_health_records.push(data);
            self.health_records.insert(caller, &patient_health_records);
        }
    }

    // /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    // /// module and test functions are marked with a `#[test]` attribute.
    // /// The below code is technically just normal Rust code.
    // #[cfg(test)]
    // mod tests {
    //     /// Imports all the definitions from the outer scope so we can use them here.
    //     use super::*;

    //     /// Imports `ink_lang` so we can use `#[ink::test]`.
    //     use ink_lang as ink;

    //     /// We test if the default constructor does its job.
    //     #[ink::test]
    //     fn default_works() {
    //         let flipper = Flipper::default();
    //         assert_eq!(flipper.get(), false);
    //     }

    //     /// We test a simple use case of our contract.
    //     #[ink::test]
    //     fn it_works() {
    //         let mut flipper = Flipper::new(false);
    //         assert_eq!(flipper.get(), false);
    //         flipper.flip();
    //         assert_eq!(flipper.get(), true);
    //     }
    // }
}
