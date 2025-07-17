#!/bin/bash

echo "🚀 Starting Massive Scale Load Test for 500,000 Concurrent Users"
echo "=================================================="

export DOTNET_ENVIRONMENT=Production
export ASPNETCORE_ENVIRONMENT=Production

echo "📊 Pre-test System Check..."
kubectl get nodes -o wide
kubectl get pods -n waaed
kubectl top nodes
kubectl top pods -n waaed

echo ""
echo "🔧 Scaling up infrastructure for massive load..."

kubectl patch hpa api-gateway-hpa -n waaed -p '{"spec":{"minReplicas":10}}'
kubectl patch hpa attendance-service-hpa -n waaed -p '{"spec":{"minReplicas":15}}'
kubectl patch hpa auth-service-hpa -n waaed -p '{"spec":{"minReplicas":15}}'
kubectl patch hpa face-recognition-service-hpa -n waaed -p '{"spec":{"minReplicas":8}}'

echo "⏳ Waiting for pods to scale up..."
sleep 60

echo ""
echo "🧪 Running Load Test Suite..."

cd /home/ubuntu/repos/AttendancePro

echo "Test 1: Authentication Load (500K users)"
dotnet test tests/performance/MassiveScaleLoadTests.cs -m Load_500K_ConcurrentUsers_AuthenticationFlow --logger "console;verbosity=detailed"

echo ""
echo "Test 2: Attendance Check-in Load (400K users)"
dotnet test tests/performance/MassiveScaleLoadTests.cs -m Load_500K_ConcurrentUsers_AttendanceCheckIn --logger "console;verbosity=detailed"

echo ""
echo "Test 3: Face Recognition Load (200K users)"
dotnet test tests/performance/MassiveScaleLoadTests.cs -m Load_500K_ConcurrentUsers_FaceRecognition --logger "console;verbosity=detailed"

echo ""
echo "Test 4: Mixed Workload (500K total users)"
dotnet test tests/performance/MassiveScaleLoadTests.cs -m Load_500K_ConcurrentUsers_MixedWorkload --logger "console;verbosity=detailed"

echo ""
echo "📈 Post-test System Analysis..."
kubectl get hpa -n waaed
kubectl top nodes
kubectl top pods -n waaed

echo ""
echo "📊 Generating Load Test Report..."
if [ -d "load_test_reports" ]; then
    echo "Load test reports generated in: $(pwd)/load_test_reports"
    ls -la load_test_reports/
else
    echo "⚠️  No load test reports found"
fi

echo ""
echo "✅ Massive Scale Load Test Complete!"
echo "Check the reports for detailed performance metrics and scaling behavior."
