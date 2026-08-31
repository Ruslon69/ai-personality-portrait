# Soul Arkana — browser-local data incident procedure

This procedure is intentionally proportionate to the current browser-local product. It is an operational checklist, not a claim of a certified security program.

## Ownership placeholder

Release blocker: assign a named incident owner and a privacy contact before public launch. Do not publish invented contact details.

## Unexpected transmission report

1. Record the affected release identifier, route, browser, time and the reporter’s description without requesting unrelated personal content.
2. Reproduce against the exact production build with network logging enabled.
3. Inventory the destination, request trigger, fields, headers and whether the data came from user input, browser storage or generated output.
4. Disable the affected deployment or feature if continued transmission can expose user information.
5. Preserve minimal technical evidence without copying Portrait answers, birth dates, audio or interpretation content into tickets or logs.
6. Compare the behavior with the published Privacy Policy and determine whether the policy, product or both are incorrect.
7. The assigned owner decides escalation and legally required notification with qualified counsel for the selected markets.

## Adding an API, analytics or external service

Before enablement:

- update the implementation inventory and data-flow diagram;
- identify purpose, fields, recipients, retention and deletion behavior;
- review consent or other required user controls;
- update Privacy Policy and Terms where relevant;
- update CSP `connect-src` and any other affected security headers narrowly;
- add failure, network and privacy regression tests;
- verify production requests against the deployed origin.

No external integration may rely on a policy update scheduled for after launch.

## Browser-local limitations

Soul Arkana cannot remotely inspect, restore or delete data held only in a user’s browser. Support must explain the actual in-product controls and browser site-data controls without claiming server deletion. A failed local write or deletion must never be reported as successful.

## Policy maintenance

Re-run the privacy inventory for every release that changes storage, networking, voice, accounts, analytics, payments, public sharing or third-party dependencies. Assign the policy revision and approval owner before public launch.
