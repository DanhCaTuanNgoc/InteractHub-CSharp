# InteractHub Testing Report

## 1) Scope

This report summarizes backend automated testing for InteractHub using the xUnit test project:
- InteractHub.Test/InteractHub.Test.csproj

Service test suites included:
- InteractHub.Test/Services/AdminServiceTests.cs
- InteractHub.Test/Services/AuthServiceTests.cs
- InteractHub.Test/Services/FriendsServiceTests.cs
- InteractHub.Test/Services/HashtagServiceTests.cs
- InteractHub.Test/Services/JwtTokenServiceTests.cs
- InteractHub.Test/Services/NotificationsServiceTests.cs
- InteractHub.Test/Services/PostsServiceTests.cs
- InteractHub.Test/Services/StoriesServiceTests.cs
- InteractHub.Test/Services/UsersServiceTests.cs

## 2) Test Execution

Executed command:

```bash
dotnet test InteractHub.Test/InteractHub.Test.csproj -c Release --collect:"XPlat Code Coverage" --logger "trx;LogFileName=TestResults.trx" --results-directory "docs/testing/results"
```

Execution summary (latest run):
- Total tests: 35
- Passed: 35
- Failed: 0
- Skipped: 0
- Duration: 11.8s
- Build result: Succeeded

Primary test result artifact:
- docs/testing/test-results.trx

Raw run artifact folder:
- docs/testing/results/

## 3) Coverage Report

Coverage collector:
- coverlet.collector (XPlat Code Coverage, Cobertura format)

Primary coverage artifact:
- docs/testing/coverage.cobertura.xml

Coverage metrics (latest run):
- Line coverage: 13.14% (746/5674)
- Branch coverage: 20.30% (67/330)

Notes:
- Current tests focus mainly on service-level unit tests.
- Coverage ratio is expectedly lower because controller, startup, and infrastructure paths are not heavily exercised in this run.

## 4) Representative Passing Test Cases

- AuthServiceTests.LoginAsync_ShouldReturnAuthResponse_WhenCredentialsValid
- AuthServiceTests.RegisterAsync_ShouldReturnAuthResponse_WhenRequestValid
- FriendsServiceTests.SendRequestAsync_ShouldCreatePendingFriendship_AndNotify
- FriendsServiceTests.AcceptRequestAsync_ShouldUpdateStatusToAccepted_AndNotify
- PostsServiceTests.CreateAsync_ShouldCreatePost_AndReturnResponse
- PostsServiceTests.ToggleLikeAsync_ShouldAddLike_AndCreateNotification
- NotificationsServiceTests.CreateAsync_ShouldPersistAndPushRealtimeEvent
- StoriesServiceTests.CreateAsync_ShouldCreateStoryWith24HourExpiry
- UsersServiceTests.UpdateProfileAsync_ShouldPersistChanges_WhenUserExists
- AdminServiceTests.ResolveReportAsync_ShouldUpdateStatus_WhenReportExists

## 5) Conclusion

All existing automated backend tests passed in the latest run, and execution/coverage artifacts are generated and stored under docs/testing for submission evidence.
